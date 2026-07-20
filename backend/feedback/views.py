from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Feedback
from .serializers import FeedbackSerializer, FeedbackCreateSerializer


class FeedbackListCreateView(ListCreateAPIView):
    """List user's feedback or submit new feedback on a scan."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FeedbackCreateSerializer
        return FeedbackSerializer

    def get_queryset(self):
        return Feedback.objects.filter(user=self.request.user).select_related('scan')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'success': True, 'message': 'Thank you for your feedback!'},
            status=status.HTTP_201_CREATED,
        )
