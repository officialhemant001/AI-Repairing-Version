import logging
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from .models import Scan, ChatMessage
from .serializers import (
    ScanCreateSerializer,
    ScanListSerializer,
    ScanDetailSerializer,
    ChatMessageSerializer,
)
from ai_engine.inference import analyze_image, analyze_text, chat_response

logger = logging.getLogger(__name__)


class ScanUploadView(APIView):
    """Analyze an appliance issue from an uploaded image."""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ScanCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image = request.FILES.get('image')
        if not image:
            return Response(
                {'error': 'No image provided.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appliance_hint = request.data.get('appliance_category', '')

        # Run AI analysis
        result = analyze_image(image, appliance_hint=appliance_hint)

        # Save scan record
        scan = Scan.objects.create(
            user=request.user if request.user.is_authenticated else None,
            image=image,
            input_type='image',
            appliance_category=result.get('appliance_category', appliance_hint or 'general'),
            issue=result.get('issue', ''),
            severity=result.get('severity', 'medium').lower(),
            confidence_score=result.get('confidence_score', 0.0),
            result=result,
            repair_difficulty=result.get('repair_difficulty', ''),
            estimated_cost=result.get('estimated_cost', ''),
            estimated_time=result.get('estimated_time', ''),
            technician_required=result.get('technician_required', False),
            safety_warning='\n'.join(result.get('safety_warnings', [])),
            description=request.data.get('description', ''),
        )

        return Response({
            'id': scan.id,
            **result,
        }, status=status.HTTP_200_OK)


class TextAnalysisView(APIView):
    """Analyze an appliance issue from text description."""
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        description = request.data.get('description', '').strip()
        if not description:
            return Response(
                {'error': 'Please describe the appliance issue.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appliance_category = request.data.get('appliance_category', '')

        result = analyze_text(description, appliance_category=appliance_category)

        scan = Scan.objects.create(
            user=request.user if request.user.is_authenticated else None,
            input_type='text',
            description=description,
            appliance_category=result.get('appliance_category', appliance_category or 'general'),
            issue=result.get('issue', ''),
            severity=result.get('severity', 'medium').lower(),
            confidence_score=result.get('confidence_score', 0.0),
            result=result,
            repair_difficulty=result.get('repair_difficulty', ''),
            estimated_cost=result.get('estimated_cost', ''),
            estimated_time=result.get('estimated_time', ''),
            technician_required=result.get('technician_required', False),
            safety_warning='\n'.join(result.get('safety_warnings', [])),
        )

        return Response({
            'id': scan.id,
            **result,
        }, status=status.HTTP_200_OK)


class ScanHistoryView(ListAPIView):
    """Get paginated scan history for the authenticated user."""
    serializer_class = ScanListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Scan.objects.filter(user=self.request.user)


class ScanDetailView(RetrieveAPIView):
    """Get full details for a specific scan."""
    serializer_class = ScanDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Scan.objects.filter(user=self.request.user)


class ChatView(APIView):
    """AI troubleshooting chat endpoint."""
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        messages = request.data.get('messages', [])
        scan_id = request.data.get('scan_id')
        appliance_context = request.data.get('appliance_category', '')

        if not messages:
            return Response(
                {'error': 'No messages provided.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the latest user message
        user_message = messages[-1].get('content', '') if messages else ''

        # Build context from scan if provided
        scan_context = None
        scan = None
        if scan_id:
            try:
                scan = Scan.objects.get(id=scan_id)
                scan_context = scan.result
            except Scan.DoesNotExist:
                pass

        # Get AI response
        ai_reply = chat_response(
            messages=messages,
            context=scan_context,
            appliance_category=appliance_context,
        )

        # Persist messages if user is authenticated
        if request.user.is_authenticated:
            ChatMessage.objects.create(
                scan=scan,
                user=request.user,
                role='user',
                content=user_message,
            )
            ChatMessage.objects.create(
                scan=scan,
                user=request.user,
                role='assistant',
                content=ai_reply,
            )

        return Response({
            'reply': ai_reply,
        }, status=status.HTTP_200_OK)