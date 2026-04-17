from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, UploadBookAPIView, BulkUploadAPIView, ChatAPIView

router = DefaultRouter()
router.register(r'books', BookViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload/', UploadBookAPIView.as_view(), name='book-upload'),
    path('bulk-upload/', BulkUploadAPIView.as_view(), name='book-bulk-upload'),
    path('chat/', ChatAPIView.as_view(), name='book-chat'),
]
