from django.urls import path, include
from . import views

app_name = "api"
urlpatterns = [
        path("/users/register/",...,...),
        path("/users/login/",...,...),
         path('posts/', views.post_list, name='post-list'),
        path("/posts/create/<int:id>",...,...),
        path("/posts/edit/<int:id>",...,...),
        

        ]
