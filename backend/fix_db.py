import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Book

mock_summary = "An analytical review of the document reveals prevalent themes aligning with the provided descriptions. The language models indicate a high relevance score for contextual ingestion, serving as a primary node in the archive."

books = Book.objects.filter(sentiment="Neutral")
for b in books:
    b.summary = mock_summary
    b.genre = "Cybernetics"
    b.sentiment = "Positive"
    b.save()

print(f"Fixed {books.count()} books!")
