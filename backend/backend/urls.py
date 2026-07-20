from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/scan/', include('scans.urls')),
    path('api/devices/', include('devices.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/feedback/', include('feedback.urls')),
    path('api/knowledge/', include('knowledge.urls')),
    path('api/analytics/', include('analytics.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)