from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from core.permissions import IsAdminUser
from .models import KnowledgeArticle, AIPromptTemplate
from .serializers import KnowledgeArticleSerializer, AIPromptTemplateSerializer


class KnowledgeArticleListCreateView(ListCreateAPIView):
    """List/create knowledge articles (admin only)."""
    serializer_class = KnowledgeArticleSerializer
    permission_classes = [IsAdminUser]
    queryset = KnowledgeArticle.objects.select_related('device_category')


class KnowledgeArticleDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve/update/delete a knowledge article (admin only)."""
    serializer_class = KnowledgeArticleSerializer
    permission_classes = [IsAdminUser]
    queryset = KnowledgeArticle.objects.all()


class AIPromptTemplateListCreateView(ListCreateAPIView):
    """List/create AI prompt templates (admin only)."""
    serializer_class = AIPromptTemplateSerializer
    permission_classes = [IsAdminUser]
    queryset = AIPromptTemplate.objects.all()


class AIPromptTemplateDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve/update/delete an AI prompt template (admin only)."""
    serializer_class = AIPromptTemplateSerializer
    permission_classes = [IsAdminUser]
    queryset = AIPromptTemplate.objects.all()
