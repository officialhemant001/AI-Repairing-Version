from django.urls import path
from .views import (
    ScanAnalyzeView,
    TextAnalysisView,
    ScanHistoryView,
    ScanDetailView,
    ScanDeleteView,
    ToggleFavoriteView,
    ToggleBookmarkView,
    BookmarkListView,
    ChatView,
    ChatSessionListView,
    ChatSessionDetailView,
)

urlpatterns = [
    # Analysis
    path('analyze/', ScanAnalyzeView.as_view(), name='scan-analyze'),
    path('analyze-text/', TextAnalysisView.as_view(), name='scan-analyze-text'),

    # Legacy endpoints (backward compatibility)
    path('upload/', ScanAnalyzeView.as_view(), name='scan-upload'),
    path('text/', TextAnalysisView.as_view(), name='scan-text'),

    # History & detail
    path('', ScanHistoryView.as_view(), name='scan-history'),
    path('history/', ScanHistoryView.as_view(), name='scan-history-alt'),
    path('<int:pk>/', ScanDetailView.as_view(), name='scan-detail'),
    path('<int:pk>/delete/', ScanDeleteView.as_view(), name='scan-delete'),

    # Favorites & bookmarks
    path('<int:pk>/favorite/', ToggleFavoriteView.as_view(), name='scan-favorite'),
    path('<int:pk>/bookmark/', ToggleBookmarkView.as_view(), name='scan-bookmark'),
    path('bookmarks/', BookmarkListView.as_view(), name='scan-bookmarks'),

    # Chat
    path('chat/', ChatView.as_view(), name='scan-chat'),
    path('chat/sessions/', ChatSessionListView.as_view(), name='chat-sessions'),
    path('chat/sessions/<int:pk>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),
]