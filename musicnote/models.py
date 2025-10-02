from django.db import models
from django.contrib.auth.models import User


class Artist(models.Model):
    name = models.CharField(max_length=200)
    picture = models.CharField()

    def __str__(self):
        return self.name


class Album(models.Model):
    name = models.CharField(max_length=200)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    cover = models.CharField()

    def __str__(self):
        return self.name


class Song(models.Model):
    name = models.CharField(max_length=200)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    preview = models.CharField()
    cover = models.CharField()
    gender = models.CharField()
    deezer_id = models.CharField(default="0", null=True, blank=True)

    def __str__(self):
        return self.name


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    RATING = [(i, str(i)) for i in range(11)]
    note = models.IntegerField(choices=RATING)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "song")

    def __str__(self):
        return f"{self.user} : {self.song}"
