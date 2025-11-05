# backend/api/urls.py
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

app_name = "api"
urlpatterns = [
    # Autentykacja JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Użytkownicy
    path('users/register/', views.CreateUserView.as_view(), name='register_user'),
    path('users/me/', views.current_user, name='current_user'),
    
    # Posty
    path('posts/', views.post_list, name='post-list'),
    
    # Komentarze
    path('posts/<int:id>/comments/', views.comment_list, name='comment-list'),
]