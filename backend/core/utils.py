"""
Shared utility functions used across multiple apps.
"""
import uuid
import os
from datetime import datetime


def generate_report_id():
    """Generate a unique report identifier (UUID4)."""
    return uuid.uuid4()


def generate_upload_path(instance, filename, prefix='uploads'):
    """
    Generate a date-partitioned upload path to keep media organized.
    Example: uploads/2024/07/abc123.jpg
    """
    ext = os.path.splitext(filename)[1].lower()
    unique_name = f'{uuid.uuid4().hex[:12]}{ext}'
    now = datetime.now()
    return os.path.join(prefix, str(now.year), f'{now.month:02d}', unique_name)


def scan_image_upload_path(instance, filename):
    """Upload path for scan images."""
    return generate_upload_path(instance, filename, prefix='scans')


def user_avatar_upload_path(instance, filename):
    """Upload path for user avatars."""
    return generate_upload_path(instance, filename, prefix='avatars')


def report_pdf_upload_path(instance, filename):
    """Upload path for generated PDF reports."""
    return generate_upload_path(instance, filename, prefix='reports')


def truncate_text(text, max_length=100):
    """Truncate text with ellipsis if it exceeds max_length."""
    if not text:
        return ''
    return text[:max_length] + '...' if len(text) > max_length else text
