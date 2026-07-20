"""
PDF Report Generator using ReportLab.

Generates professional diagnostic reports with company branding,
QR codes, device images, analysis details, and safety instructions.
"""
import io
import os
import logging
import tempfile
from datetime import datetime

from django.conf import settings

logger = logging.getLogger(__name__)

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, mm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        Image as RLImage, HRFlowable, PageBreak,
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logger.warning('ReportLab not installed. PDF generation will be unavailable.')

try:
    import qrcode
    QR_AVAILABLE = True
except ImportError:
    QR_AVAILABLE = False


def _generate_qr_code(data, output_path):
    """Generate a QR code image from data."""
    if not QR_AVAILABLE:
        return None

    qr = qrcode.QRCode(version=1, box_size=6, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    img.save(output_path)
    return output_path


def generate_pdf_report(scan):
    """
    Generate a professional PDF report for a scan.

    Returns: (pdf_path, qr_path, report_data_dict)
    """
    if not REPORTLAB_AVAILABLE:
        logger.error('ReportLab is not installed. Cannot generate PDF.')
        return None, None, {}

    # Prepare report data snapshot
    report_data = {
        'report_id': str(scan.report_id),
        'device_name': scan.device_name or 'Unknown Device',
        'category': scan.category.name if scan.category else scan.appliance_category.replace('_', ' ').title(),
        'issue': scan.issue,
        'severity': scan.severity,
        'confidence_score': scan.confidence_score,
        'root_cause': scan.root_cause,
        'affected_components': scan.affected_components,
        'possible_causes': scan.possible_causes,
        'repair_steps': scan.repair_steps or scan.result.get('repair_steps', []),
        'tools_required': scan.tools_required or scan.result.get('tools_required', []),
        'safety_warnings': scan.safety_warnings or scan.result.get('safety_warnings', []),
        'preventive_maintenance': scan.preventive_maintenance,
        'repair_difficulty': scan.repair_difficulty,
        'estimated_cost': scan.estimated_cost,
        'estimated_time': scan.estimated_time,
        'technician_required': scan.technician_required,
        'generated_at': datetime.now().isoformat(),
        'upload_date': scan.created_at.isoformat() if scan.created_at else '',
    }

    # Create temp files
    temp_dir = tempfile.mkdtemp()
    pdf_path = os.path.join(temp_dir, f'report_{scan.report_id}.pdf')
    qr_path = os.path.join(temp_dir, f'qr_{scan.report_id}.png')

    # Generate QR code
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    qr_url = f'{frontend_url}/reports/{scan.report_id}'
    qr_generated = _generate_qr_code(qr_url, qr_path)

    # Build PDF
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'ReportTitle', parent=styles['Title'],
        fontSize=22, textColor=colors.HexColor('#1e3a5f'),
        spaceAfter=6,
    )
    heading_style = ParagraphStyle(
        'SectionHeading', parent=styles['Heading2'],
        fontSize=14, textColor=colors.HexColor('#2563eb'),
        spaceBefore=16, spaceAfter=8,
        borderWidth=0, borderPadding=0,
    )
    body_style = ParagraphStyle(
        'ReportBody', parent=styles['Normal'],
        fontSize=10, leading=14,
        spaceAfter=4,
    )
    warning_style = ParagraphStyle(
        'Warning', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#dc2626'),
        leading=14, spaceAfter=4,
    )
    small_style = ParagraphStyle(
        'SmallText', parent=styles['Normal'],
        fontSize=8, textColor=colors.grey,
    )

    elements = []

    # ── Header / Branding ──
    app_name = getattr(settings, 'APP_NAME', 'AI Repair Vision')
    elements.append(Paragraph(f'🔧 {app_name}', title_style))
    elements.append(Paragraph('AI-Powered Device Diagnostic Report', ParagraphStyle(
        'Subtitle', parent=styles['Normal'],
        fontSize=12, textColor=colors.HexColor('#64748b'),
        spaceAfter=12,
    )))
    elements.append(HRFlowable(width='100%', thickness=2, color=colors.HexColor('#2563eb')))
    elements.append(Spacer(1, 12))

    # ── Report Meta ──
    meta_data = [
        ['Report ID:', str(scan.report_id)],
        ['Generated:', datetime.now().strftime('%B %d, %Y at %I:%M %p')],
        ['Upload Date:', scan.created_at.strftime('%B %d, %Y') if scan.created_at else 'N/A'],
    ]
    meta_table = Table(meta_data, colWidths=[100, 350])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#475569')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1e293b')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 16))

    # ── QR Code ──
    if qr_generated and os.path.exists(qr_path):
        elements.append(Paragraph('Scan QR Code to view this report online:', small_style))
        elements.append(Spacer(1, 4))
        elements.append(RLImage(qr_path, width=80, height=80))
        elements.append(Spacer(1, 12))

    # ── Device Information ──
    elements.append(Paragraph('📱 Device Information', heading_style))
    device_data = [
        ['Device:', report_data['device_name']],
        ['Category:', report_data['category']],
    ]
    device_table = Table(device_data, colWidths=[100, 350])
    device_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(device_table)
    elements.append(Spacer(1, 8))

    # ── AI Analysis Summary ──
    elements.append(Paragraph('🤖 AI Analysis', heading_style))

    severity_colors = {
        'low': '#22c55e', 'medium': '#eab308',
        'high': '#f97316', 'critical': '#ef4444',
    }
    sev_color = severity_colors.get(report_data['severity'], '#64748b')
    confidence_pct = round(report_data['confidence_score'] * 100)

    analysis_data = [
        ['Detected Issue:', report_data['issue']],
        ['Severity:', report_data['severity'].upper()],
        ['AI Confidence:', f'{confidence_pct}%'],
        ['Repair Difficulty:', report_data['repair_difficulty'] or 'N/A'],
        ['Estimated Cost:', report_data['estimated_cost'] or 'N/A'],
        ['Estimated Time:', report_data['estimated_time'] or 'N/A'],
        ['Technician Required:', 'Yes' if report_data['technician_required'] else 'No'],
    ]
    analysis_table = Table(analysis_data, colWidths=[130, 320])
    analysis_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TEXTCOLOR', (1, 1), (1, 1), colors.HexColor(sev_color)),
    ]))
    elements.append(analysis_table)
    elements.append(Spacer(1, 8))

    # ── Root Cause ──
    if report_data['root_cause']:
        elements.append(Paragraph('🔍 Root Cause Analysis', heading_style))
        elements.append(Paragraph(report_data['root_cause'], body_style))
        elements.append(Spacer(1, 8))

    # ── Affected Components ──
    if report_data['affected_components']:
        elements.append(Paragraph('⚙️ Affected Components', heading_style))
        for comp in report_data['affected_components']:
            elements.append(Paragraph(f'• {comp}', body_style))
        elements.append(Spacer(1, 8))

    # ── Safety Warnings ──
    if report_data['safety_warnings']:
        elements.append(Paragraph('⚠️ Safety Instructions', heading_style))
        for warning in report_data['safety_warnings']:
            elements.append(Paragraph(f'⚠ {warning}', warning_style))
        elements.append(Spacer(1, 8))

    # ── Repair Procedure ──
    if report_data['repair_steps']:
        elements.append(Paragraph('🔧 Repair Procedure', heading_style))
        for i, step in enumerate(report_data['repair_steps'], 1):
            elements.append(Paragraph(f'<b>Step {i}:</b> {step}', body_style))
        elements.append(Spacer(1, 8))

    # ── Required Tools ──
    if report_data['tools_required']:
        elements.append(Paragraph('🧰 Required Tools', heading_style))
        for tool in report_data['tools_required']:
            elements.append(Paragraph(f'• {tool}', body_style))
        elements.append(Spacer(1, 8))

    # ── Preventive Maintenance ──
    if report_data['preventive_maintenance']:
        elements.append(Paragraph('🛡️ Maintenance Tips', heading_style))
        elements.append(Paragraph(report_data['preventive_maintenance'], body_style))
        elements.append(Spacer(1, 8))

    # ── Footer ──
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#e2e8f0')))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f'Generated by {app_name} | AI-Powered Device Diagnostics | '
        f'This report is for informational purposes only. Always consult a qualified technician for complex repairs.',
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=7, textColor=colors.grey, alignment=TA_CENTER),
    ))

    # Build PDF
    doc.build(elements)

    return pdf_path, qr_path if qr_generated else None, report_data
