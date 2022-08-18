from django.conf import settings
from django.urls import path
from django.conf.urls.static import static
from app_netsupport.views import (
    HomeView,
    TechniciansByCity
)


urlpatterns = [
    path('', HomeView, name='HomeView'),
    path('api/search/technicians/', TechniciansByCity.as_view(), name='TechniciansByCity'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)