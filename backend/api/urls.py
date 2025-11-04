from django.urls import path, include
from . import views

app_name = "api"
urlpatterns = [
        path("users/register/", views.register_user, name="register_user"),
        path("/users/login/",...,...),
        path('posts/', views.post_list, name='post-list'),
        path("/posts/create/<int:id>",...,...),
        path("/posts/edit/<int:id>",...,...),
        

        ]
