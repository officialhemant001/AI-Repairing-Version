from django.urls import path
from .views import (
    ScanUploadView,
    TextAnalysisView,
    ScanHistoryView,
    ScanDetailView,
    ChatView,
)

urlpatterns = [
    path('upload/', ScanUploadView.as_view(), name='scan-upload'),
    path('text/', TextAnalysisView.as_view(), name='scan-text'),
    path('history/', ScanHistoryView.as_view(), name='scan-history'),
    path('chat/', ChatView.as_view(), name='scan-chat'),
    path('<int:pk>/', ScanDetailView.as_view(), name='scan-detail'),
]