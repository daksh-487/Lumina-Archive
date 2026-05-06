from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from .models import Book
from .serializers import BookSerializer
from .ai_utils import process_and_store_book, rag_query, get_smart_recommendations
from django.db.models import Q
import threading

class BookViewSet(viewsets.ModelViewSet):
    """
    GET APIs for Books:
    - Lists all uploaded books
    - Retrieves details
    - Smart recommendation logic using embeddings and genre matching
    """
    queryset = Book.objects.all().order_by('-created_at')
    serializer_class = BookSerializer

    @action(detail=True, methods=['get'])
    def recommend(self, request, pk=None):
        """
        Enhanced recommendation endpoint using embeddings-based similarity.
        Returns books with personalized reasoning: "If you like X, you'll like Y"
        """
        book = self.get_object()
        
        # Get smart recommendations (includes caching and similarity scoring)
        recommendations = get_smart_recommendations(book, limit=4)
        
        if not recommendations:
            return Response({
                "message": f"No recommendations found for '{book.title}'",
                "recommendations": []
            })
        
        # Format response with reasoning
        recommendation_data = []
        for rec in recommendations:
            rec_serializer = BookSerializer(rec["book"])
            recommendation_data.append({
                "book": rec_serializer.data,
                "reason": rec["reason"],
                "similarity_score": rec.get("similarity_score")
            })
        
        return Response({
            "message": f"Because you liked '{book.title}', you might like these books:",
            "recommendations": recommendation_data
        })

class UploadBookAPIView(APIView):
    """
    POST API: Uploading and processing books with AI insights.
    Generates Summary, Genre, Sentiment in background thread.
    """
    def post(self, request):
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            book = serializer.save()
            
            # Use threading to prevent blocking API response while AI does the heavy lifting
            def ai_worker():
                process_and_store_book(book)
                # Clear recommendations cache for all books since a new book was added
                try:
                    cache.delete_pattern("recommendations_*")
                except (AttributeError, NotImplementedError):
                    pass  # LocMemCache doesn't support delete_pattern
                
            thread = threading.Thread(target=ai_worker)
            thread.start()
            
            return Response(
                {
                    "message": "Book uploaded successfully! AI is currently processing insights.", 
                    "book_id": book.id,
                    "status": "Processing Summary, Genre Classification, and Sentiment Analysis..."
                }, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BulkUploadAPIView(APIView):
    """
    Bonus: Bulk scraping pipeline ingestion.
    """
    def post(self, request):
        books_data = request.data
        if not isinstance(books_data, list):
            return Response({"error": "Expected a list of books."}, status=400)
            
        return_ids = []
        for b_data in books_data:
            ser = BookSerializer(data=b_data)
            if ser.is_valid():
                book = ser.save()
                return_ids.append(book.id)
                threading.Thread(target=process_and_store_book, args=(book,)).start()
                
        return Response({"message": f"Successfully queued {len(return_ids)} books for processing."})

class ChatAPIView(APIView):
    """
    POST API: RAG-based Q&A about books with caching.
    Uses vector search + LLM for intelligent context-aware answers.
    """
    def post(self, request):
        question = request.data.get('question')
        book_id = request.data.get('book_id')
        if not question:
            return Response({"error": "No question provided"}, status=400)
        
        # Improved cache key using question content hash for better collision avoidance
        cache_key = f"rag_query_{hash(question) % (10 ** 12)}_{book_id}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return Response({**cached_result, "from_cache": True})
        
        result = rag_query(question, book_id=book_id)
        
        # Cache results for 24 hours (longer TTL for better performance)
        cache.set(cache_key, result, timeout=60*60*24)
        
        return Response({**result, "from_cache": False})
