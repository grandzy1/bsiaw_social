from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

app_name = "api"
urlpatterns = [
        #path("users/register/", views.register_user, name="register_user"),
        path('users/register/', views.CreateUserView.as_view(), name="register_user"),
        #path("users/login/", views.login_user, name="login_user"),
        #tutaj albo "token/" albo "login/" w obu przypadkach chodzi o wysłanie username/password i dostanie tokenów jezeli się wszystko zgadza
        path('token/', TokenObtainPairView.as_view(), name="get_token"),
        #Wysyłamy token refresh, dostajemy ponownie token acces
        path('token/refresh/', TokenRefreshView.as_view(), name="refresh"),
        path('posts/', views.post_list, name='post-list'),
        path('posts/<int:id>/comments/', views.comment_list, name='comment-list'),
        ]
