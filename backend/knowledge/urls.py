from django.urls import path
from .views import (
    KnowledgeArticleListCreateView,
    KnowledgeArticleDetailView,
    AIPromptTemplateListCreateView,
    AIPromptTemplateDetailView,
)

urlpatterns = [
    path('articles/', KnowledgeArticleListCreateView.as_view(), name='knowledge-articles'),
    path('articles/<int:pk>/', KnowledgeArticleDetailView.as_view(), name='knowledge-article-detail'),
    path('prompts/', AIPromptTemplateListCreateView.as_view(), name='ai-prompts'),
    path('prompts/<int:pk>/', AIPromptTemplateDetailView.as_view(), name='ai-prompt-detail'),
]
