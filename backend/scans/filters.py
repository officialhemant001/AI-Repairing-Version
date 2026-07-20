"""
Django-filter filtersets for scan queries.
"""
import django_filters
from .models import Scan


class ScanFilter(django_filters.FilterSet):
    """
    Filterset for scan history queries.

    Supported filters:
        ?severity=high
        ?status=diagnosed
        ?category=mobile  (by category slug)
        ?input_type=image
        ?is_favorite=true
        ?created_after=2024-01-01
        ?created_before=2024-12-31
    """

    category = django_filters.CharFilter(
        field_name='category__slug', lookup_expr='exact'
    )
    created_after = django_filters.DateTimeFilter(
        field_name='created_at', lookup_expr='gte'
    )
    created_before = django_filters.DateTimeFilter(
        field_name='created_at', lookup_expr='lte'
    )

    class Meta:
        model = Scan
        fields = ['severity', 'status', 'input_type', 'is_favorite']
