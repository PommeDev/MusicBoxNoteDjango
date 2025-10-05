from django.contrib import admin

from .models import *

admin.site.register(Artist)
admin.site.register(Album)
admin.site.register(Review)
admin.site.register(Song)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio', 'profile_picture')