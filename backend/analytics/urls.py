from django.urls import path
from .views import AdminDashboardView, AdminUserListView, AdminFeedbackListView

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('feedback/', AdminFeedbackListView.as_view(), name='admin-feedback'),
]
