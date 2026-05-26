from django.db import models
from django.conf import settings


class Scan(models.Model):
    """Stores AI scan results for appliance troubleshooting."""

    # Input type choices
    INPUT_TYPE_CHOICES = [
        ('image', 'Image'),
        ('text', 'Text'),
        ('voice', 'Voice'),
        ('chat', 'Chat'),
    ]

    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('diagnosed', 'Diagnosed'),
        ('in_progress', 'In Progress'),
        ('repaired', 'Repaired'),
    ]

    APPLIANCE_CHOICES = [
        ('ceiling_fan', 'Ceiling Fan'),
        ('cooler', 'Cooler'),
        ('ac', 'AC'),
        ('refrigerator', 'Refrigerator'),
        ('washing_machine', 'Washing Machine'),
        ('water_pump', 'Water Pump'),
        ('tv', 'TV'),
        ('mixer_grinder', 'Mixer Grinder'),
        ('microwave', 'Microwave'),
        ('electric_iron', 'Electric Iron'),
        ('geyser', 'Geyser'),
        ('general', 'General Electrical Appliance'),
    ]

    # User (nullable for guest scans)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    # Input data
    image = models.ImageField(upload_to='scans/%Y/%m/', null=True, blank=True)
    description = models.TextField(blank=True, default='')
    input_type = models.CharField(
        max_length=10, choices=INPUT_TYPE_CHOICES, default='image'
    )

    # AI analysis result
    appliance_category = models.CharField(
        max_length=30, choices=APPLIANCE_CHOICES, default='general'
    )
    issue = models.CharField(max_length=500, blank=True, default='')
    severity = models.CharField(
        max_length=10, choices=SEVERITY_CHOICES, default='medium'
    )
    confidence_score = models.FloatField(default=0.0)
    result = models.JSONField(default=dict)

    # Repair details
    repair_difficulty = models.CharField(max_length=50, blank=True, default='')
    estimated_cost = models.CharField(max_length=100, blank=True, default='')
    estimated_time = models.CharField(max_length=100, blank=True, default='')
    technician_required = models.BooleanField(default=False)
    safety_warning = models.TextField(blank=True, default='')

    # Status tracking
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default='diagnosed'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.appliance_category} — {self.issue[:50]}"


class ChatMessage(models.Model):
    """Stores individual messages in a troubleshooting chat session."""

    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]

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
        return f"{self.role}: {self.content[:50]}"