from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from api.views import (
    PostViewSet, ProfileViewSet, CommentViewSet,
    register, login, logout, current_user, refresh_token, get_csrf_token
)

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    # Panel admina
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(router.urls)),
    
    # Autentykacja JWT
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login, name='login'),
    path('api/auth/logout/', logout, name='logout'),
    path('api/auth/refresh/', refresh_token, name='refresh-token'),
    path('api/auth/user/', current_user, name='current-user'),
    path('api/auth/csrf/', get_csrf_token, name='csrf-token'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)