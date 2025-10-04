from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.models import User
from .models import Song, Review, Artist, Album
from .deezer_api import get_preview, get_all_track_by_name
from django.http import (
    JsonResponse,
    HttpResponseForbidden,
    StreamingHttpResponse,
    Http404,
)
from django.views.decorators.http import require_GET
from django.db import IntegrityError
from django.db.models import Avg
from django.utils import timezone
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth import login, logout

import requests


def user(request, user_id):
    userData = get_object_or_404(User, pk=user_id)
    list_reviews = userData.review_set.all()
    for review in list_reviews:
        track_id = review.song.deezer_id  # Supposons que song = id_deezer (int ou str)
        review.song.preview = get_preview(track_id)

    return render(
        request,
        "musicnote/user.html",
        {
            "userData": userData,
            "reviews": list_reviews,
            "is_owner": userData == request.user,
        },
    )


def index(request):
    tracks = []
    name = request.POST.get("name", "")
    if name:
        try:
            tracks = get_all_track_by_name(name)
        except Exception:
            tracks = []

    return render(
        request, "musicnote/index.html", {"tracks": tracks, "request": request.user}
    )


def song(request, song_id):
    songData = get_object_or_404(Song, pk=song_id)
    preview = get_preview(songData.deezer_id)

    review_b = Review.objects.filter(song=song_id).order_by("-note", "-created_at")[:5]
    review_w = (
        Review.objects.filter(song=song_id)
        .exclude(pk__in=review_b.values_list("pk", flat=True))
        .order_by("note", "-created_at")[:5]
    )

    user_review = Review.objects.filter(song=song_id, user=request.user.id)
    comment = ""

    if request.method == "POST":
        comment = request.POST.get("comment", "").strip()
        note = request.POST.get("note", "").strip()

        # Validation simple
        if comment and note.isdigit():
            note = int(note)
            if 0 <= note <= 10:
                try:
                    if user_review.exists():
                        # update la review existante
                        review = user_review.first()
                        review.comment = comment
                        review.note = note
                        review.created_at = timezone.now()
                        review.save()
                    else:
                        review = Review.objects.create(
                            song=songData,
                            user=request.user,
                            comment=comment,
                            note=note,
                        )
                except IntegrityError:
                    # Ici, la review existe déjà (user + song unique)
                    # Tu peux gérer ça comme tu veux :
                    # - afficher un message d’erreur
                    # - ou mettre à jour la review existante
                    # - ou juste ignorer la requête
                    # Exemple simple : on redirige avec un message flash (voir plus bas)
                    from django.contrib import messages

                    messages.error(
                        request, "Vous avez déjà posté une review pour cette chanson."
                    )
                    return redirect(request.path)

    try:
        note_mean = round(
            Review.objects.filter(song=song_id).aggregate(Avg("note"))["note__avg"]
        )
    except Exception:
        note_mean = None

    if user_review:
        return render(
            request,
            "musicnote/song.html",
            {
                "songData": songData,
                "preview": preview,
                "reviews_b": review_b,
                "reviews_w": review_w,
                "user_review": user_review[0],
                "note_mean": note_mean,
                "id": song_id,
            },
        )
    else:
        return render(
            request,
            "musicnote/song.html",
            {
                "songData": songData,
                "preview": preview,
                "reviews_b": review_b,
                "reviews_w": review_w,
                "user_review": [],
                "note_mean": note_mean,
                "id": song_id,
            },
        )


@require_GET
def search_ajax(request):
    query = request.GET.get("q", "").strip()

    if len(query) < 2:
        return JsonResponse({"tracks": []})

    # Recherche locale dans la base de données
    local_tracks = Song.objects.filter(name__icontains=query)[:10]

    results = [
        {
            "title": track.name,
            "artist": {"name": track.artist.name},
            "id": track.pk,
            "in_data_base": True,
        }
        for track in local_tracks
    ]

    # Si déjà trouvé en base, on stocke une "clé unique" pour éviter les doublons
    seen_keys = set(
        (track["title"].lower(), track["artist"]["name"].lower()) for track in results
    )

    # ➕ Appel Deezer
    deezer_response = requests.get("https://api.deezer.com/search", params={"q": query})
    if deezer_response.status_code != 200:
        return JsonResponse(
            {"tracks": results}
        )  # On retourne uniquement les résultats de la base

    deezer_data = deezer_response.json()

    # Ajout uniquement des morceaux non présents dans la base
    for track in deezer_data.get("data", [])[:10]:
        key = (track["title"].lower(), track["artist"]["name"].lower())
        if key not in seen_keys:
            results.append(
                {
                    "title": track["title"],
                    "artist": {"name": track["artist"]["name"]},
                    "deezer_id": track["id"],
                    "in_data_base": False,
                }
            )
            seen_keys.add(key)

    # Résultat final sans doublons (priorité à la base de données)
    return JsonResponse({"tracks": results})


def add_deezer_song(request, deezer_id):
    # Récupération depuis l'API Deezer
    response = requests.get(f"https://api.deezer.com/track/{deezer_id}")
    if response.status_code != 200:
        return redirect("/")  # ou afficher une erreur

    data = response.json()

    artist_name = data["artist"]["name"]
    song_title = data["title"]
    album_title = data["album"]["title"]
    cover = data["album"]["cover_medium"]

    # Vérifie si l'artiste existe
    artist, _ = Artist.objects.get_or_create(
        name=artist_name, picture=data["artist"]["picture"]
    )
    album, _ = Album.objects.get_or_create(name=album_title, cover=cover, artist=artist)

    # Vérifie si la chanson existe déjà
    song, created = Song.objects.get_or_create(
        name=song_title,
        artist=artist,
        album=album,
        deezer_id=data["id"],
        cover=cover,
    )

    return redirect("musicnote:song", song.id)


def delete_review(request, review_id):
    review = get_object_or_404(Review, id=review_id)

    if review.user != request.user:
        return HttpResponseForbidden("Tu ne peux pas supprimer cette review.")

    song_id = review.song.id
    review.delete()

    return redirect("musicnote:song", song_id=song_id)


def signup_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()  # crée l’utilisateur
            login(request, user)  # connecte directement après inscription
            return redirect(request.META.get('HTTP_REFERER', '/'))  # redirige vers l’accueil
    else:
        form = UserCreationForm()
    return render(request, "musicnote/signup.html", {"form": form})


def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            next_url = request.GET.get('next') or request.POST.get('next') or '/'
            return redirect(next_url)
    else:
        form = AuthenticationForm()
    return render(request, "musicnote/login.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect("musicnote:login")


def audio_proxy(request, song_id):
    song = get_object_or_404(Song, pk=song_id)
    preview_url = get_preview(song.deezer_id)  # ta fonction qui retourne l’URL Deezer

    try:
        r = requests.get(preview_url, stream=True, timeout=10)
        r.raise_for_status()
    except requests.RequestException:
        raise Http404("Impossible de récupérer le preview depuis Deezer")

    # Réponse en streaming pour ne pas charger tout le fichier en RAM
    resp = StreamingHttpResponse(
        r.iter_content(8192),
        content_type=r.headers.get("Content-Type", "audio/mpeg"),
    )

    # Ajout des headers nécessaires
    resp["Access-Control-Allow-Origin"] = "*"  # CORS
    resp["Access-Control-Allow-Headers"] = "Range"  # pour que l’audio puisse seek
    resp["Accept-Ranges"] = "bytes"

    return resp
