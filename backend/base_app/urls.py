from django.urls import path

from . import views

app_name = "base_app"
urlpatterns = [
        # ex: /
        path("", views.index, name="index"),
        # ex: /login
        path("login", views.login_page, name="login"),
        # ex: /register
        path("register", views.register_page, name="register"),
        # ex: /profile/<user>
        path("profile/<str:username>", views.user_profile, name="user_profile" ),
        # ex: /logout_page
        path("logout_page", views.logout_view, name="logout_page"),
        path("post/new/", views.add_post, name="add_post"),
        ]
