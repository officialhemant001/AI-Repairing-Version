from django.urls import path
from .views import (
    GenerateReportView,
    ReportListView,
    ReportDetailView,
    ReportDownloadView,
    SharedReportView,
    ToggleReportSharingView,
)

urlpatterns = [
    path('generate/<int:scan_id>/', GenerateReportView.as_view(), name='report-generate'),
    path('', ReportListView.as_view(), name='report-list'),
    path('<int:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('<int:pk>/download/', ReportDownloadView.as_view(), name='report-download'),
    path('<int:pk>/share/', ToggleReportSharingView.as_view(), name='report-share'),
    path('share/<uuid:share_token>/', SharedReportView.as_view(), name='report-shared'),
]
