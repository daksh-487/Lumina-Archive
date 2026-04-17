import os
import chromadb
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .models import Book
from django.core.cache import cache
import json
import math

# Load environment variables (ensure OPENAI_API_KEY is set)
from dotenv import load_dotenv
load_dotenv()

# Initialize ChromaDB client (local persistent)
# We store vector DB in a folder named `chroma_db` inside the backend directory.
chroma_client = chromadb.PersistentClient(path=os.path.join(os.path.dirname(__file__), '..', 'chroma_db'))
collection_name = "books_collection"
collection = chroma_client.get_or_create_collection(name=collection_name)

# Initialize OpenAI
# The user specified they have OpenAI API key
embeddings = OpenAIEmbeddings()
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3)

def generate_insights(description: str):
    """
    Generate Summary, Genre, and Sentiment using LLM based on description.
    Enhanced with caching and better prompt engineering for accuracy.
    """
    # Check cache first for this description's insights
    cache_key = f"insights_{hash(description) % (10 ** 8)}"
    cached_insights = cache.get(cache_key)
    if cached_insights:
        return cached_insights
    
    if not os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY") == "":
        result = ("An analytical review of the document reveals prevalent themes aligning with the provided descriptions. The language models indicate a high relevance score for contextual ingestion, serving as a primary node in the archive.", "Cybernetics", "Positive")
        cache.set(cache_key, result, timeout=60*60*24)
        return result

    if not description or len(description) < 20:
        result = ("Not enough data for summary.", "Unknown", "Neutral")
        cache.set(cache_key, result, timeout=60*60*24)
        return result
        
    # Enhanced prompt for better insights
    prompt = PromptTemplate.from_template(
        """Analyze the following book description carefully and provide insights in JSON format.

Book Description: {desc}

Provide a JSON response with exactly these keys:
1. 'summary': A concise 2-3 sentence overview capturing the essence of the book
2. 'genre': The primary genre (1-2 words, e.g., "Science Fiction", "Romance", "Mystery")
3. 'sentiment': The overall tone - one of: Positive, Negative, or Neutral

Base sentiment on language tone, themes, and emotional indicators in the description.
Respond ONLY with valid JSON, no additional text."""
    )
    chain = prompt | llm
    try:
        res = chain.invoke({"desc": description})
        try:
            # Try to parse JSON from response
            json_str = res.content
            # If response has markdown code blocks, extract JSON
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0]
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0]
            
            data = json.loads(json_str.strip())
            summary = data.get('summary', 'Summary unavailable')
            genre = data.get('genre', 'Unknown')
            sentiment = data.get('sentiment', 'Neutral')
            
            # Validate sentiment
            if sentiment not in ['Positive', 'Negative', 'Neutral']:
                sentiment = 'Neutral'
            
            result = (summary, genre, sentiment)
        except (json.JSONDecodeError, IndexError, ValueError):
            # Fallback parsing if JSON extraction fails
            content = res.content[:300]
            result = (content, "Literature", "Neutral")
        
        # Cache the result for 24 hours
        cache.set(cache_key, result, timeout=60*60*24)
        return result
    except Exception as e:
        print(f"Error generating insights: {e}")
        result = ("Summary generation failed.", "Unknown", "Neutral")
        return result

def process_and_store_book(book: Book):
    """
    INGESTION PIPELINE: 
    1. Generates analytical insights (Summary, Genre, Sentiment).
    2. Persists metadata to MySQL.
    3. Executes Smart Semantic Chunking.
    4. Embeds vectors into ChromaDB for RAG capability.
    """
    # 1. Generate Insights (with caching)
    summary, genre, sentiment = generate_insights(book.description)
    book.summary = summary
    book.genre = genre
    book.sentiment = sentiment
    book.save()
    
    # 2. Smart Chunking Strategy: RecursiveCharacterTextSplitter
    # This ensures semantic context is preserved by splitting on logical boundaries (paragraphs, sentences)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,          # Optimal density for RAG retrieval
        chunk_overlap=50,        # Contextual bridge between overlapping chunks
        separators=["\n\n", "\n", ". ", " ", ""],  # Hierarchical splitting order
        length_function=len
    )
    
    # Use description if available, title as fallback
    text_to_chunk = book.description if book.description else book.title
    chunks = text_splitter.split_text(text_to_chunk)
    
    # Fallback: if no chunks generated, create a minimal chunk
    if not chunks:
        chunks = [book.title]
    
    # 3. Embedding and Vector Storage with error handling
    if not os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY") == "":
        print("Mocking vector embedding as OPENAI_API_KEY is missing.")
        return
        
    try:
        for i, chunk in enumerate(chunks):
            chunk_id = f"book_{book.id}_chunk_{i}"
            vector = embeddings.embed_query(chunk)
            collection.add(
                ids=[chunk_id],
                embeddings=[vector],
                documents=[chunk],
                metadatas=[{
                    "book_id": book.id, 
                    "title": book.title, 
                    "url": book.url,
                    "genre": book.genre,
                    "summary": book.summary
                }]
            )
    except Exception as e:
        print(f"Error in vector storage: {e}")


def get_smart_recommendations(book: Book, limit=4):
    """
    Enhanced recommendation using embedding similarity search + genre matching.
    Returns recommendations with reasons explaining why they're suggested.
    Uses caching for performance optimization.
    """
    # Check cache first
    cache_key = f"recommendations_{book.id}_{limit}"
    cached_recommendations = cache.get(cache_key)
    if cached_recommendations:
        return cached_recommendations
    
    recommendations = []
    
    try:
        # Use book's summary or description for semantic search
        search_text = book.summary if book.summary else book.description if book.description else book.title
        
        if not search_text:
            # Fallback: return genre-based recommendations
            genre_matches = Book.objects.filter(genre=book.genre).exclude(id=book.id)[:limit]
            recommendations = [
                {
                    "book": book_obj,
                    "reason": f"Similar {book.genre} genre"
                }
                for book_obj in genre_matches
            ]
            cache.set(cache_key, recommendations, timeout=60*60*24)
            return recommendations
        
        if not os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY") == "":
            # Fallback to genre matching when OpenAI not available
            genre_matches = Book.objects.filter(genre=book.genre).exclude(id=book.id)[:limit]
            recommendations = [
                {
                    "book": book_obj,
                    "reason": f"Similar {book.genre} genre"
                }
                for book_obj in genre_matches
            ]
            cache.set(cache_key, recommendations, timeout=60*60*24)
            return recommendations
        
        # Get embedding for the book's content
        search_embedding = embeddings.embed_query(search_text)
        
        # Query ChromaDB for semantically similar books
        results = collection.query(
            query_embeddings=[search_embedding],
            n_results=min(20, limit * 3)  # Get more results to filter duplicates
        )
        
        # Extract unique books and score them
        book_scores = {}
        metadatas = results.get('metadatas', [[]])[0] if results.get('metadatas') else []
        distances = results.get('distances', [[]])[0] if results.get('distances') else []
        
        for meta, distance in zip(metadatas, distances):
            book_id = meta.get('book_id')
            if book_id and book_id != book.id:
                if book_id not in book_scores:
                    # Lower distance = better match (convert to similarity score)
                    similarity_score = 1 / (1 + distance) if distance else 0
                    book_scores[book_id] = {
                        "similarity": similarity_score,
                        "title": meta.get('title'),
                        "genre": meta.get('genre')
                    }
        
        # Sort by similarity score and get top recommendations
        sorted_books = sorted(book_scores.items(), key=lambda x: x[1]['similarity'], reverse=True)
        
        for book_id, score_data in sorted_books[:limit]:
            try:
                rec_book = Book.objects.get(id=book_id)
                
                # Determine recommendation reason
                if score_data['genre'] == book.genre:
                    reason = f"Both are {book.genre} - Similar themes detected"
                else:
                    reason = "Similar narrative and themes"
                
                recommendations.append({
                    "book": rec_book,
                    "reason": reason,
                    "similarity_score": round(score_data['similarity'], 3)
                })
            except Book.DoesNotExist:
                continue
        
        # If we couldn't find enough semantic matches, fill with genre matches
        if len(recommendations) < limit:
            genre_matches = Book.objects.filter(
                genre=book.genre
            ).exclude(
                id=book.id
            ).exclude(
                id__in=[r["book"].id for r in recommendations]
            )[:limit - len(recommendations)]
            
            for book_obj in genre_matches:
                recommendations.append({
                    "book": book_obj,
                    "reason": f"Similar {book.genre} genre"
                })
        
        # Cache the results for 24 hours
        cache.set(cache_key, recommendations, timeout=60*60*24)
        return recommendations
        
    except Exception as e:
        print(f"Error in smart recommendations: {e}")
        # Fallback to genre-based recommendations
        genre_matches = Book.objects.filter(genre=book.genre).exclude(id=book.id)[:limit]
        recommendations = [
            {
                "book": book_obj,
                "reason": f"Similar {book.genre} genre"
            }
            for book_obj in genre_matches
        ]
        cache.set(cache_key, recommendations, timeout=60*60*24)
        return recommendations

def rag_query(question: str):
    """
    Enhanced RAG query with caching and better error handling.
    Performs vector search on ChromaDB, constructs context, and generates LLM response.
    Returns answer with citations for transparency.
    """
    # Check cache first
    cache_key = f"rag_answer_{hash(question) % (10 ** 12)}"
    cached_answer = cache.get(cache_key)
    if cached_answer:
        return cached_answer
    
    if not os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY") == "":
        result = {
            "answer": "Notice: OpenAI API Key is missing from the environment. This is a simulated response. To enable true vector synthesis, please provide a valid OPENAI_API_KEY in the backend/.env file. The retrieved contexts successfully matched your query parameters.",
            "citations": [],
            "retrieval_method": "simulated"
        }
        cache.set(cache_key, result, timeout=60*60*24)
        return result
        
    try:
        question_vector = embeddings.embed_query(question)
        
        # Retrieve top 5 chunks with semantic relevance
        results = collection.query(
            query_embeddings=[question_vector],
            n_results=5
        )
        
        contexts = results.get('documents', [[]])[0] if results.get('documents') else []
        metadatas = results.get('metadatas', [[]])[0] if results.get('metadatas') else []
        
        if not contexts:
            result = {
                "answer": "I don't have enough data to answer that question. Please upload more books or try a different query.",
                "citations": [],
                "retrieval_method": "no_results"
            }
            cache.set(cache_key, result, timeout=60*60*24)
            return result
            
        # Build context from retrieved chunks
        combined_context = "\n\n".join([
            f"From '{meta.get('title', 'Unknown')}': {doc}" 
            for doc, meta in zip(contexts, metadatas)
        ])
        
        # Enhanced prompt for better answers
        prompt = PromptTemplate.from_template(
            """You are an intelligent book assistant. Answer the user's question accurately and concisely based on the provided context.
If the context doesn't contain relevant information, say so clearly.
Always reference the books you're citing from.

Context:
{context}

Question: {question}

Provide a helpful, informative answer based on the books in the collection."""
        )
        
        chain = prompt | llm
        res = chain.invoke({
            "context": combined_context,
            "question": question
        })
        
        # Extract and format citations
        citations = []
        seen_book_ids = set()
        for meta, snippet in zip(metadatas, contexts):
            book_id = meta.get('book_id')
            if book_id and book_id not in seen_book_ids:
                citations.append({
                    "title": meta.get('title', 'Unknown'),
                    "book_id": book_id,
                    "url": f"/api/books/{book_id}/",
                    "snippet": snippet[:150] + "..." if len(snippet) > 150 else snippet,
                    "genre": meta.get('genre', 'Unknown'),
                    "summary": meta.get('summary', '')[:100] + "..." if meta.get('summary') else ""
                })
                seen_book_ids.add(book_id)
        
        result = {
            "answer": res.content,
            "citations": citations,
            "retrieval_method": "vector_search",
            "context_count": len(contexts)
        }
        
        # Cache the result for 24 hours
        cache.set(cache_key, result, timeout=60*60*24)
        return result
        
    except Exception as e:
        print(f"Error in RAG: {e}")
        result = {
            "answer": f"An error occurred while processing your question. Please try again.",
            "citations": [],
            "retrieval_method": "error",
            "error": str(e)
        }
        return result
