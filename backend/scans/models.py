"""
Scan models — stores AI analysis results, multi-image uploads,
bookmarks, and chat sessions for device troubleshooting.
"""
import uuid

from django.db import models
from django.conf import settings

from core.utils import scan_image_upload_path


class Scan(models.Model):
    """Stores AI scan/analysis results for device troubleshooting."""

    # ── Input type choices ──
    INPUT_TYPE_CHOICES = [
        ('image', 'Image'),
        ('text', 'Text'),
        ('voice', 'Voice'),
        ('chat', 'Chat'),
        ('pdf', 'PDF Upload'),
    ]

    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('diagnosed', 'Diagnosed'),
        ('in_progress', 'In Progress'),
        ('repaired', 'Repaired'),
        ('failed', 'Failed'),
    ]

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('difficult', 'Difficult'),
        ('professional', 'Professional Only'),
    ]

    # ── Identifiers ──
    report_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    # ── Relationships ──
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    category = models.ForeignKey(
        'devices.DeviceCategory',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scans',
    )

    # ── Input data ──
    device_name = models.CharField(max_length=200, blank=True, default='')
    image = models.ImageField(upload_to=scan_image_upload_path, null=True, blank=True)
    description = models.TextField(blank=True, default='')
    input_type = models.CharField(
        max_length=10, choices=INPUT_TYPE_CHOICES, default='image'
    )

    # ── AI analysis result (full JSON) ──
    result = models.JSONField(default=dict)

    # ── Extracted analysis fields ──
    issue = models.CharField(max_length=500, blank=True, default='')
    severity = models.CharField(
        max_length=10, choices=SEVERITY_CHOICES, default='medium'
    )
    confidence_score = models.FloatField(default=0.0)
    root_cause = models.TextField(blank=True, default='')
    affected_components = models.JSONField(default=list, blank=True)
    possible_causes = models.JSONField(default=list, blank=True)
    troubleshooting_steps = models.JSONField(default=list, blank=True)
    repair_steps = models.JSONField(default=list, blank=True)
    tools_required = models.JSONField(default=list, blank=True)
    safety_warnings = models.JSONField(default=list, blank=True)
    preventive_maintenance = models.TextField(blank=True, default='')

    # ── Repair details ──
    repair_difficulty = models.CharField(
        max_length=20, choices=DIFFICULTY_CHOICES, blank=True, default=''
    )
    estimated_cost = models.CharField(max_length=100, blank=True, default='')
    estimated_time = models.CharField(max_length=100, blank=True, default='')
    technician_required = models.BooleanField(default=False)

    # ── Status & user actions ──
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default='diagnosed'
    )
    is_favorite = models.BooleanField(default=False)

    # ── Legacy field for backward compatibility ──
    appliance_category = models.CharField(max_length=50, blank=True, default='general')

    # ── Timestamps ──
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['severity']),
            models.Index(fields=['status']),
            models.Index(fields=['report_id']),
        ]

    def __str__(self):
        category_name = self.category.name if self.category else self.appliance_category
        return f'{category_name} — {self.issue[:50]}'


class ScanImage(models.Model):
    """
    Stores multiple images per scan (device photo, damaged component, etc.).
    """

    IMAGE_TYPE_CHOICES = [
        ('device', 'Device Image'),
        ('damage', 'Damaged Component'),
        ('label', 'Device Label'),
        ('manual', 'Manual Page'),
        ('other', 'Other'),
    ]

    scan = models.ForeignKey(
        Scan, on_delete=models.CASCADE, related_name='images'
    )
    image = models.ImageField(upload_to=scan_image_upload_path)
    image_type = models.CharField(
        max_length=10, choices=IMAGE_TYPE_CHOICES, default='device'
    )
    caption = models.CharField(max_length=200, blank=True, default='')
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'created_at']

    def __str__(self):
        return f'{self.image_type} for Scan #{self.scan_id}'


class ScanDocument(models.Model):
    """
    Stores uploaded PDF documents (manuals, previous repair reports).
    """

    DOC_TYPE_CHOICES = [
        ('manual', 'Device Manual'),
        ('repair_report', 'Previous Repair Report'),
        ('warranty', 'Warranty Document'),
        ('other', 'Other'),
    ]

    scan = models.ForeignKey(
        Scan, on_delete=models.CASCADE, related_name='documents'
    )
    file = models.FileField(upload_to='documents/%Y/%m/')
    doc_type = models.CharField(
        max_length=15, choices=DOC_TYPE_CHOICES, default='manual'
    )
    original_filename = models.CharField(max_length=255, blank=True, default='')
    extracted_text = models.TextField(
        blank=True, default='',
        help_text='OCR-extracted text from the document',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.doc_type}: {self.original_filename}'


class Bookmark(models.Model):
    """User bookmarks for quick access to important scans."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookmarks',
    )
    scan = models.ForeignKey(
        Scan, on_delete=models.CASCADE, related_name='bookmarks'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'scan')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} → Scan #{self.scan_id}'


class ChatSession(models.Model):
    """Groups chat messages into a named session."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='chat_sessions',
    )
    scan = models.ForeignKey(
        Scan, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='chat_sessions',
    )
    title = models.CharField(max_length=200, blank=True, default='New Chat')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'Chat: {self.title}'


class ChatMessage(models.Model):
    """Stores individual messages in a troubleshooting chat session."""

    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]

    session = models.ForeignKey(
        ChatSession, on_delete=models.CASCADE,
        related_name='messages',
        null=True, blank=True,
    )
    # Legacy fields for backward compatibility
    scan = models.ForeignKey(
        Scan, on_delete=models.CASCADE,
        related_name='chat_messages',
        null=True, blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True,
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    image = models.ImageField(upload_to='chat/%Y/%m/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.role}: {self.content[:50]}'