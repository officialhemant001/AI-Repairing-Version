"""
Custom pagination classes for consistent API response structure.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    """
    Standard pagination with configurable page size.

    Query params:
        ?page=1       — page number
        ?page_size=20 — items per page (max 100)

    Response structure:
    {
        "count": 150,
        "total_pages": 8,
        "current_page": 1,
        "page_size": 20,
        "next": "http://api.example.com/items/?page=2",
        "previous": null,
        "results": [...]
    }
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
        })


class SmallPagination(PageNumberPagination):
    """Small pagination for lightweight list endpoints (e.g., recent items)."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
