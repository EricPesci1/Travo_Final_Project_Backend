from django.urls import path

from . import views

urlpatterns = [
    path("login/", views.login, name="auth-login"),
    path("password/login/", views.password_login, name="auth-password-login"),
    path("me/", views.me, name="auth-me"),
]

