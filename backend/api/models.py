from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=512)
    author = models.CharField(max_length=255, default='Unknown')
    rating = models.FloatField(default=0.0)
    description = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True, help_text="AI Generated Summary")
    genre = models.CharField(max_length=100, blank=True, null=True, help_text="AI Classified Genre")
    sentiment = models.CharField(max_length=50, blank=True, null=True, help_text="AI Sentiment Analysis")
    url = models.URLField(max_length=1024, blank=True, null=True)
    image_url = models.URLField(max_length=1024, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} by {self.author}"

# Note: We will use ChromaDB separately for storing the actual embeddings.
# This MySQL table manages the metadata.
