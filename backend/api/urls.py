from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from api.views import (
    PostViewSet, ProfileViewSet, CommentViewSet,
    CustomAuthToken, register, logout, current_user
)

# Router dla ViewSetów
router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    # Panel admina
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(router.urls)),
    
    # Autentykacja
    path('api/auth/login/', CustomAuthToken.as_view(), name='login'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/logout/', logout, name='logout'),
    path('api/auth/user/', current_user, name='current-user'),
]

# Serwowanie plików media w trybie deweloperskim
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)