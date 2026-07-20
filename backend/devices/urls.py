from django.urls import path
from .views import DeviceCategoryListView

urlpatterns = [
    path('categories/', DeviceCategoryListView.as_view(), name='device-categories'),
]
