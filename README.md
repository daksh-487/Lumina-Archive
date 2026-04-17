# 📚 Lumina Archive — Document Intelligence Platform

<<<<<<< HEAD
A full-stack AI-powered platform that automates book data collection, stores it in a structured backend, and enables intelligent querying via a complete RAG (Retrieval-Augmented Generation) pipeline.
=======
A high-performance, full-stack intelligence platform that harmonizes automated data collection, MySQL persistence, and advanced RAG (Retrieval-Augmented Generation) to deliver deep document insights.

## 🖼️ User Interface
![Dashboard Overview](screenshots/overview.png)
![Research Terminal](screenshots/chat.png)
![Document Insight Profile](screenshots/detail.png)
![Inline RAG Context](screenshots/inline_rag.png)

## 🚀 Key Features

*   **AI Insight Suite**: Every document is automatically processed to generate:
    *   **Summary**: A concise multi-sentence overview of core content.
    *   **Genre Classification**: Accurate categorization (e.g., Cybernetics, Mystery, Sci-Fi).
    *   **Sentiment Analysis**: Tone detection (Positive/Neutral/Negative).
*   **Smart Recommendation Engine**: "If you like X, you'll like Y" logic powered by semantic embedding similarity.
*   **Advanced RAG Pipeline**: An intelligent query interface that synthesizes cited answers from multiple records.
*   **Automated Scraper**: Robust Selenium-based ingestion engine.
>>>>>>> 7d39aef64dcf77f5aa06cba525dc0aa1fb501c72

---

## 🖼️ Screenshots

| Dashboard | Book Detail |
|-----------|-------------|
| ![Dashboard](screenshots/overview.png) | ![Detail](screenshots/detail.png) |

| Q&A / RAG Interface | Inline RAG Context |
|---------------------|-------------------|
| ![Chat](screenshots/chat.png) | ![RAG](screenshots/inline_rag.png) |

---

## 🚀 Features

- **Automated Scraper** — Selenium-based engine collects book data (title, author, rating, reviews, description, URL) from the web automatically.
- **AI Insight Suite** — Every book is processed to generate:
  - **Summary**: A concise multi-sentence overview of the book's content.
  - **Genre Classification**: Predicts genre from the book's description (e.g., Mystery, Sci-Fi, Cybernetics).
  - **Sentiment Analysis**: Detects tone of reviews/descriptions (Positive / Neutral / Negative).
- **Smart Recommendation Engine** — "If you like X, you'll like Y" logic powered by semantic embedding similarity (ChromaDB vector search).
- **Full RAG Pipeline** — Embeds user questions, performs similarity search over book chunks, retrieves context, and generates cited answers using an LLM.
- **Caching Layer (Redis)** — Expensive LLM/RAG results are cached for 24 hours to avoid repeated API calls.
- **Advanced Chunking** — Uses `RecursiveCharacterTextSplitter` with overlapping windows for superior retrieval accuracy.
- **Async Embedding** — Background threading keeps the UI responsive during ingestion.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django REST Framework (Python) |
| Database | MySQL (metadata) + ChromaDB (vectors) |
| Caching | Redis |
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |
| AI / LLM | OpenAI API (GPT-4o, text-embedding-3-small) |
| Scraping | Selenium |

---

## 📥 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (for MySQL, Redis, ChromaDB)
- OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/daksh-487/Lumina-Archive.git
cd Lumina-Archive
```

### 2. Start Infrastructure (Docker)

```bash
docker-compose up -d
```

This starts MySQL, Redis, and ChromaDB containers.

### 3. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `/backend`:

```env
OPENAI_API_KEY=your_openai_api_key_here
MYSQL_DB=lumina_archive
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_HOST=localhost
MYSQL_PORT=3306
REDIS_URL=redis://localhost:6379/0
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

### 4. Run the Scraper

```bash
cd backend
python scraper/run_scraper.py
```

This scrapes book data from the web and triggers AI insight generation automatically.

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🔌 API Documentation

### GET Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/books/` | List all books (title, author, rating, reviews, description, book URL) |
| `GET /api/books/<id>/` | Full details + AI insights for a specific book |
| `GET /api/books/<id>/recommend/` | Semantic similarity-based book recommendations |

### POST Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/books/` | Upload and process a new book (triggers scraping + AI insight generation) |
| `POST /api/chat/` | RAG Q&A — ask a question about any book in the archive |

### Request / Response Examples

**POST `/api/books/`**
```json
// Request Body
{
  "url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html"
}

// Response
{
  "id": 42,
  "title": "A Light in the Attic",
  "author": "Shel Silverstein",
  "rating": 4.5,
  "description": "...",
  "book_url": "https://books.toscrape.com/...",
  "summary": "A whimsical poetry collection...",
  "genre": "Poetry / Children's",
  "sentiment": "Positive"
}
```

**POST `/api/chat/`**
```json
// Request Body
{
  "question": "Which books deal with themes of loneliness and identity?"
}

// Response
{
  "answer": "Based on the archive, 'The Stranger' by Albert Camus and 'Norwegian Wood' by Haruki Murakami both explore deep themes of alienation and identity. Camus approaches it through existentialist philosophy, while Murakami uses coming-of-age narrative.",
  "citations": [
    { "book_id": 7, "title": "The Stranger", "chunk": "Meursault's detachment from society..." },
    { "book_id": 12, "title": "Norwegian Wood", "chunk": "Toru's isolation after his friend's death..." }
  ]
}
```

---

## 🤖 Sample Questions & Answers

**Q: "What is the best book for someone interested in artificial intelligence?"**
> "Based on the archive, **'Life 3.0'** by Max Tegmark is highly recommended for AI enthusiasts. It covers the long-term societal implications of superintelligence with a balanced, accessible tone. Genre: Non-Fiction / Technology. Sentiment: Neutral-Positive."
> *Citations: [Life 3.0 — chunk 3], [Life 3.0 — chunk 7]*

---

**Q: "Recommend a mystery novel with high ratings."**
> "The archive contains **'Gone Girl'** by Gillian Flynn (rating: 4.8/5), a psychological thriller with intense suspense and unreliable narration. If you enjoy it, you'll also like **'The Girl with the Dragon Tattoo'** based on shared genre and tone embeddings."
> *Citations: [Gone Girl — chunk 2]*

---

**Q: "Which book has the most positive sentiment in its reviews?"**
> "**'Harry Potter and the Sorcerer's Stone'** has the highest positive sentiment score (0.91) in the archive, driven by overwhelmingly enthusiastic reviews mentioning wonder, imagination, and nostalgia."
> *Citations: [Harry Potter — chunk 1], [Harry Potter — chunk 5]*

---

## 💎 Bonus Features Implemented

- ✅ **Redis Caching** — RAG and AI insight results cached for 24 hours
- ✅ **Embedding-based Vector Search** — ChromaDB with `text-embedding-3-small`
- ✅ **Async Processing** — Background threads for embedding generation
- ✅ **Multi-page Scraping** — Scraper traverses paginated book listings
- ✅ **Advanced Chunking** — Overlapping recursive character splitting
- ✅ **Loading States** — Skeleton loaders and spinners on all async UI actions
- ✅ **Chat History** — Q&A sessions are persisted per user session

---

## 📁 Project Structure

```
Lumina-Archive/
├── backend/
│   ├── books/              # Django app: models, views, serializers
│   ├── rag/                # RAG pipeline: embeddings, chunking, retrieval
│   ├── scraper/            # Selenium scraper
│   ├── insights/           # AI insight generation (summary, genre, sentiment)
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── app/                # Next.js app router pages
│   ├── components/         # Reusable UI components
│   └── package.json
├── docker-compose.yml
├── screenshots/
└── README.md
```

---

## 📦 Dependencies

See [`backend/requirements.txt`](backend/requirements.txt) for the full list. Key packages:

```
django>=4.2
djangorestframework
selenium
openai
chromadb
langchain
redis
mysqlclient
sentence-transformers
```

---

## 📬 Contact

For any questions about this project, feel free to reach out via the repository issues tab.
