"""
Report views — generate, list, download, and share PDF reports.
"""
import logging

from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.http import FileResponse

from .models import Report
from .serializers import ReportListSerializer, ReportDetailSerializer
from .pdf_generator import generate_pdf_report
from scans.models import Scan

logger = logging.getLogger(__name__)


class GenerateReportView(APIView):
    """Generate a PDF report for a given scan."""

    permission_classes = [IsAuthenticated]

    def post(self, request, scan_id):
        try:
            scan = Scan.objects.get(id=scan_id, user=request.user)
        except Scan.DoesNotExist:
            return Response(
                {'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Scan not found.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if a report already exists — increment version
        existing_report = Report.objects.filter(scan=scan, user=request.user).first()
        version = 1
        if existing_report:
            version = existing_report.version + 1

        try:
            pdf_path, qr_path, report_data = generate_pdf_report(scan)

            report = Report.objects.create(
                scan=scan,
                user=request.user,
                version=version,
                report_data=report_data,
            )

            # Save generated files
            if pdf_path:
                from django.core.files import File
                with open(pdf_path, 'rb') as f:
                    report.pdf_file.save(f'report_{report.report_uuid}.pdf', File(f))
                if qr_path:
                    with open(qr_path, 'rb') as f:
                        report.qr_code_image.save(f'qr_{report.report_uuid}.png', File(f))
                report.save()

            serializer = ReportDetailSerializer(report)
            return Response({
                'success': True,
                'data': serializer.data,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f'Report generation failed: {e}')
            return Response(
                {'success': False, 'error': {'code': 'GENERATION_FAILED', 'message': 'Failed to generate PDF report.'}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ReportListView(ListAPIView):
    """List all reports for the authenticated user."""

    serializer_class = ReportListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user).select_related('scan', 'scan__category')


class ReportDetailView(RetrieveAPIView):
    """Get full report details."""

    serializer_class = ReportDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user).prefetch_related('versions')


class ReportDownloadView(APIView):
    """Download the PDF file for a report."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = Report.objects.get(pk=pk, user=request.user)
        except Report.DoesNotExist:
            return Response(
                {'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Report not found.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not report.pdf_file:
            return Response(
                {'success': False, 'error': {'code': 'NO_FILE', 'message': 'PDF file not available.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

        return FileResponse(
            report.pdf_file.open('rb'),
            content_type='application/pdf',
            as_attachment=True,
            filename=f'AI_Repair_Report_{report.report_uuid}.pdf',
        )


class SharedReportView(RetrieveAPIView):
    """Public endpoint to view a shared report via its share token."""

    serializer_class = ReportDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'share_token'

    def get_queryset(self):
        return Report.objects.filter(is_public=True)


class ToggleReportSharingView(APIView):
    """Toggle public sharing for a report."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            report = Report.objects.get(pk=pk, user=request.user)
        except Report.DoesNotExist:
            return Response(
                {'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Report not found.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

        report.is_public = not report.is_public
        report.save(update_fields=['is_public'])

        share_url = None
        if report.is_public:
            share_url = f'{request.build_absolute_uri("/api/reports/share/")}{report.share_token}/'

        return Response({
            'success': True,
            'data': {
                'is_public': report.is_public,
                'share_url': share_url,
            },
        })
