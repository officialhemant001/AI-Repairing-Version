"""
Report models — stores generated PDF reports with versioning and sharing support.
"""
import uuid

from django.db import models
from django.conf import settings

from core.utils import report_pdf_upload_path


class Report(models.Model):
    """Stores a generated PDF report linked to a scan analysis."""

    report_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    scan = models.ForeignKey(
        'scans.Scan', on_delete=models.CASCADE, related_name='reports'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='report_set'
    )
    pdf_file = models.FileField(upload_to=report_pdf_upload_path, null=True, blank=True)
    qr_code_image = models.ImageField(upload_to='qr_codes/%Y/%m/', null=True, blank=True)
    version = models.PositiveIntegerField(default=1)
    report_data = models.JSONField(default=dict, help_text='Snapshot of analysis data at report generation time')

    # Sharing
    is_public = models.BooleanField(default=False, help_text='Allow access via shareable link')
    share_token = models.UUIDField(default=uuid.uuid4, unique=True)

    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['report_uuid']),
            models.Index(fields=['share_token']),
        ]

    def __str__(self):
        return f'Report {self.report_uuid} (v{self.version})'


class ReportVersion(models.Model):
    """Tracks version history of a report."""

    report = models.ForeignKey(
        Report, on_delete=models.CASCADE, related_name='versions'
    )
    version_number = models.PositiveIntegerField()
    pdf_file = models.FileField(upload_to=report_pdf_upload_path)
    changes = models.JSONField(default=dict, help_text='Description of changes in this version')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ('report', 'version_number')

    def __str__(self):
        return f'Report {self.report.report_uuid} — v{self.version_number}'
