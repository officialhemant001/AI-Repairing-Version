"""
Analytics views — provides admin dashboard data.
"""
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Avg, Q
from django.db.models.functions import TruncDate

from core.permissions import IsAdminUser
from users.models import User
from scans.models import Scan
from reports.models import Report
from feedback.models import Feedback


class AdminDashboardView(APIView):
    """Provides aggregate analytics data for the admin dashboard."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)

        # ── Overview stats ──
        total_users = User.objects.count()
        total_scans = Scan.objects.count()
        total_reports = Report.objects.count()
        total_feedback = Feedback.objects.count()

        new_users_7d = User.objects.filter(date_joined__gte=seven_days_ago).count()
        new_scans_7d = Scan.objects.filter(created_at__gte=seven_days_ago).count()

        # ── Severity distribution ──
        severity_dist = dict(
            Scan.objects.values_list('severity')
            .annotate(count=Count('id'))
            .values_list('severity', 'count')
        )

        # ── Top categories ──
        top_categories = list(
            Scan.objects.values('appliance_category')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # ── Scans per day (last 30 days) ──
        scans_per_day = list(
            Scan.objects.filter(created_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        # Serialize dates
        for item in scans_per_day:
            item['date'] = item['date'].isoformat()

        # ── Average confidence score ──
        avg_confidence = Scan.objects.aggregate(
            avg=Avg('confidence_score')
        )['avg'] or 0.0

        # ── Average feedback rating ──
        avg_rating = Feedback.objects.aggregate(
            avg=Avg('rating')
        )['avg'] or 0.0

        # ── Input type breakdown ──
        input_types = dict(
            Scan.objects.values_list('input_type')
            .annotate(count=Count('id'))
            .values_list('input_type', 'count')
        )

        return Response({
            'success': True,
            'data': {
                'overview': {
                    'total_users': total_users,
                    'total_scans': total_scans,
                    'total_reports': total_reports,
                    'total_feedback': total_feedback,
                    'new_users_7d': new_users_7d,
                    'new_scans_7d': new_scans_7d,
                },
                'severity_distribution': severity_dist,
                'top_categories': top_categories,
                'scans_per_day': scans_per_day,
                'avg_confidence': round(avg_confidence, 2),
                'avg_rating': round(avg_rating, 1),
                'input_type_breakdown': input_types,
            },
        })


class AdminUserListView(APIView):
    """List all users with stats (admin only)."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.annotate(
            scans_count=Count('scan'),
        ).order_by('-date_joined').values(
            'id', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'date_joined', 'scans_count',
        )

        return Response({
            'success': True,
            'data': list(users),
        })


class AdminFeedbackListView(APIView):
    """List all feedback (admin only)."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        feedback = Feedback.objects.select_related('user', 'scan').values(
            'id', 'user__email', 'scan__issue', 'rating',
            'comment', 'is_helpful', 'created_at',
        ).order_by('-created_at')

        return Response({
            'success': True,
            'data': list(feedback),
        })
