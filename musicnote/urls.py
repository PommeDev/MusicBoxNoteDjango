from django.urls import path
from . import views

app_name = "musicnote"
urlpatterns = [
    path("user/<int:user_id>", views.user, name="user"),
    path("", views.index, name="index"),
    path("search/", views.search_ajax, name="search_ajax"),
    path("song/<int:song_id>", views.song, name="song"),
    path(
        "add_deezer_song/<int:deezer_id>", views.add_deezer_song, name="add_deezer_song"
    ),
    path("review/<int:review_id>/delete/", views.delete_review, name="delete_review"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("signup/", views.signup_view, name="signup"),
    path("", views.index, name="home"),
    path("audio/<int:song_id>", views.audio_proxy, name="audio_proxy"),
    path("update_profile",views.update_profile,name="update_profile"),
]

