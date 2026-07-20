from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from .models import DeviceCategory
from .serializers import DeviceCategorySerializer


class DeviceCategoryListView(ListAPIView):
    """List all active device categories. Public endpoint (no auth required)."""

    serializer_class = DeviceCategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Return all categories without pagination

    def get_queryset(self):
        return DeviceCategory.objects.filter(is_active=True)
