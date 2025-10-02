import requests


def get_deezer_track_from_id(id_track):
    url = f"https://api.deezer.com/track/{id_track}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        return data["data"]  # Liste des artistes correspondants
    else:
        return None


def get_preview(id_track):
    url = f"https://api.deezer.com/track/{id_track}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        return data["preview"]  # Liste des artistes correspondants
    else:
        return None


def get_all_track_by_name(name):
    url = f"https://api.deezer.com/search/track?q={name}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        return data["data"]
    else:
        return None
