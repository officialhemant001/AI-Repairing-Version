"""
Scan views — enhanced with filtering, search, favorites, bookmarks, and delete.
"""
import logging

from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Scan, ScanImage, ScanDocument, Bookmark, ChatSession, ChatMessage
from .serializers import (
    ScanCreateSerializer,
    ScanListSerializer,
    ScanDetailSerializer,
    BookmarkSerializer,
    ChatMessageSerializer,
    ChatSessionSerializer,
    ChatSessionDetailSerializer,
)
from .filters import ScanFilter
from devices.models import DeviceCategory
from ai_engine.pipeline import analyze_device, analyze_text_description

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Analysis Endpoints
# ──────────────────────────────────────────────

class ScanAnalyzeView(APIView):
    """
    Analyze an electronic device from uploaded image(s) and/or PDF documents.
    Supports multi-image upload, device category selection, and optional PDF manual.
    """

    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ScanCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image = request.FILES.get('image')
        additional_images = request.FILES.getlist('additional_images')
        pdf_file = request.FILES.get('pdf_document')

        if not image and not request.data.get('description'):
            return Response(
                {'success': False, 'error': {'code': 'NO_INPUT', 'message': 'Please provide an image or description.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Resolve device category
        category_slug = request.data.get('category_slug', '')
        category = None
        if category_slug:
            try:
                category = DeviceCategory.objects.get(slug=category_slug, is_active=True)
            except DeviceCategory.DoesNotExist:
                pass

        # Run AI analysis pipeline
        result = analyze_device(
            image=image,
            category=category,
            description=request.data.get('description', ''),
            device_name=request.data.get('device_name', ''),
        )

        # Create scan record
        scan = Scan.objects.create(
            user=request.user if request.user.is_authenticated else None,
            image=image,
            category=category,
            device_name=result.get('device_name', request.data.get('device_name', '')),
            input_type='image' if image else 'text',
            description=request.data.get('description', ''),
            appliance_category=result.get('appliance_category', 'general'),
            issue=result.get('issue', ''),
            severity=result.get('severity', 'medium').lower(),
            confidence_score=result.get('confidence_score', 0.0),
            result=result,
            root_cause=result.get('root_cause', ''),
            affected_components=result.get('affected_components', []),
            possible_causes=result.get('possible_causes', []),
            troubleshooting_steps=result.get('troubleshooting_steps', []),
            repair_steps=result.get('repair_steps', []),
            tools_required=result.get('tools_required', []),
            safety_warnings=result.get('safety_warnings', []),
            preventive_maintenance=result.get('preventive_maintenance', ''),
            repair_difficulty=result.get('repair_difficulty', ''),
            estimated_cost=result.get('estimated_cost', ''),
            estimated_time=result.get('estimated_time', ''),
            technician_required=result.get('technician_required', False),
        )

        # Save additional images
        for idx, img in enumerate(additional_images):
            ScanImage.objects.create(
                scan=scan,
                image=img,
                image_type='damage',
                display_order=idx + 1,
            )

        # Save PDF document
        if pdf_file:
            ScanDocument.objects.create(
                scan=scan,
                file=pdf_file,
                doc_type='manual',
                original_filename=pdf_file.name,
            )

        return Response({
            'success': True,
            'data': {
                'id': scan.id,
                'report_id': str(scan.report_id),
                **result,
            },
        }, status=status.HTTP_200_OK)


class TextAnalysisView(APIView):
    """Analyze a device issue from text description."""

    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        description = request.data.get('description', '').strip()
        if not description:
            return Response(
                {'success': False, 'error': {'code': 'NO_INPUT', 'message': 'Please describe the device issue.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category_slug = request.data.get('category_slug', '')
        category = None
        if category_slug:
            try:
                category = DeviceCategory.objects.get(slug=category_slug, is_active=True)
            except DeviceCategory.DoesNotExist:
                pass

        # Also support legacy appliance_category parameter
        appliance_category = request.data.get('appliance_category', '')

        result = analyze_text_description(
            description=description,
            category=category,
            appliance_category=appliance_category,
        )

        scan = Scan.objects.create(
            user=request.user if request.user.is_authenticated else None,
            input_type='text',
            description=description,
            category=category,
            device_name=result.get('device_name', ''),
            appliance_category=result.get('appliance_category', appliance_category or 'general'),
            issue=result.get('issue', ''),
            severity=result.get('severity', 'medium').lower(),
            confidence_score=result.get('confidence_score', 0.0),
            result=result,
            root_cause=result.get('root_cause', ''),
            affected_components=result.get('affected_components', []),
            possible_causes=result.get('possible_causes', []),
            troubleshooting_steps=result.get('troubleshooting_steps', []),
            repair_steps=result.get('repair_steps', []),
            tools_required=result.get('tools_required', []),
            safety_warnings=result.get('safety_warnings', []),
            preventive_maintenance=result.get('preventive_maintenance', ''),
            repair_difficulty=result.get('repair_difficulty', ''),
            estimated_cost=result.get('estimated_cost', ''),
            estimated_time=result.get('estimated_time', ''),
            technician_required=result.get('technician_required', False),
        )

        return Response({
            'success': True,
            'data': {
                'id': scan.id,
                'report_id': str(scan.report_id),
                **result,
            },
        }, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────
# Scan History & Detail
# ──────────────────────────────────────────────

class ScanHistoryView(ListAPIView):
    """
    Get paginated scan history for the authenticated user.
    Supports filtering by category, severity, status, date range.
    Supports search by issue text and device name.
    Supports ordering by created_at, severity, confidence_score.
    """

    serializer_class = ScanListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ScanFilter
    search_fields = ['issue', 'device_name', 'description', 'appliance_category']
    ordering_fields = ['created_at', 'severity', 'confidence_score']
    ordering = ['-created_at']

    def get_queryset(self):
        return Scan.objects.filter(user=self.request.user).select_related('category')


class ScanDetailView(RetrieveAPIView):
    """Get full details for a specific scan."""

    serializer_class = ScanDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Scan.objects.filter(
            user=self.request.user
        ).select_related('category').prefetch_related('images', 'documents')


class ScanDeleteView(DestroyAPIView):
    """Delete a specific scan."""

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Scan.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {'success': True, 'message': 'Scan deleted successfully.'},
            status=status.HTTP_200_OK,
        )


# ──────────────────────────────────────────────
# Favorites & Bookmarks
# ──────────────────────────────────────────────

class ToggleFavoriteView(APIView):
    """Toggle the favorite status of a scan."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            scan = Scan.objects.get(pk=pk, user=request.user)
        except Scan.DoesNotExist:
            return Response(
                {'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Scan not found.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

        scan.is_favorite = not scan.is_favorite
        scan.save(update_fields=['is_favorite'])

        return Response({
            'success': True,
            'data': {'is_favorite': scan.is_favorite},
        })


class ToggleBookmarkView(APIView):
    """Toggle bookmark on a scan."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            scan = Scan.objects.get(pk=pk, user=request.user)
        except Scan.DoesNotExist:
            return Response(
                {'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Scan not found.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

        bookmark, created = Bookmark.objects.get_or_create(
            user=request.user, scan=scan
        )

        if not created:
            bookmark.delete()
            return Response({
                'success': True,
                'data': {'is_bookmarked': False},
            })

        return Response({
            'success': True,
            'data': {'is_bookmarked': True},
        })


class BookmarkListView(ListAPIView):
    """List all bookmarked scans for the authenticated user."""

    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(
            user=self.request.user
        ).select_related('scan', 'scan__category')


# ──────────────────────────────────────────────
# Chat Endpoints
# ──────────────────────────────────────────────

class ChatView(APIView):
    """AI troubleshooting chat endpoint."""

    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        messages = request.data.get('messages', [])
        scan_id = request.data.get('scan_id')
        session_id = request.data.get('session_id')
        appliance_context = request.data.get('appliance_category', '')

        if not messages:
            return Response(
                {'success': False, 'error': {'code': 'NO_INPUT', 'message': 'No messages provided.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

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

        # Import here to avoid circular imports
        from ai_engine.pipeline import chat_with_ai

        ai_reply = chat_with_ai(
            messages=messages,
            context=scan_context,
            appliance_category=appliance_context,
        )

        # Persist messages if user is authenticated
        if request.user.is_authenticated:
            # Get or create chat session
            session = None
            if session_id:
                try:
                    session = ChatSession.objects.get(
                        id=session_id, user=request.user
                    )
                except ChatSession.DoesNotExist:
                    pass

            if not session:
                session = ChatSession.objects.create(
                    user=request.user,
                    scan=scan,
                    title=user_message[:100] if user_message else 'New Chat',
                )

            ChatMessage.objects.create(
                session=session,
                scan=scan,
                user=request.user,
                role='user',
                content=user_message,
            )
            ChatMessage.objects.create(
                session=session,
                scan=scan,
                user=request.user,
                role='assistant',
                content=ai_reply,
            )

            return Response({
                'success': True,
                'data': {
                    'reply': ai_reply,
                    'session_id': session.id,
                },
            }, status=status.HTTP_200_OK)

        return Response({
            'success': True,
            'data': {'reply': ai_reply},
        }, status=status.HTTP_200_OK)


class ChatSessionListView(ListAPIView):
    """List chat sessions for the authenticated user."""

    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)


class ChatSessionDetailView(RetrieveAPIView):
    """Get all messages in a chat session."""

    serializer_class = ChatSessionDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(
            user=self.request.user
        ).prefetch_related('messages')