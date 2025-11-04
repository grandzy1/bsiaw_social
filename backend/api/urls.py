from django.http import path
from . import views

app_name = "api"
urlpatterns = [
        path("/users/register/",...,...),
        path("/users/login/",...,...),
         path('posts/', views.post_list, name='post-list'),
        path("/posts/create/<int:id>",...,...),
        path("/posts/edit/<int:id>",...,...),
        

        ]
