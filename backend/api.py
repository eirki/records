from __future__ import annotations

import json
from operator import itemgetter
import os
import random
from typing import Optional, TypedDict
import uuid

import spotipy
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth

from . import config

scope = [
    "user-library-read",
    "user-library-modify",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
]


class CacheHandler(spotipy.cache_handler.CacheHandler):
    def __init__(self):
        self.cache_path = ".cache_" + str(uuid.uuid4())

    def get_cached_token(self) -> Optional[dict]:
        if not os.path.exists(self.cache_path):
            return None
        with open(self.cache_path) as f:
            token_info = json.load(f)
        return token_info

    def save_token_to_cache(self, token_info: dict) -> None:
        print("save_token_to_cache")
        with open(self.cache_path, "w") as file_:
            json.dump(token_info, file_)
        self.token_info = token_info

    def delete_cached_token(self) -> None:
        os.remove(self.cache_path)


def auther(cache) -> SpotifyOAuth:
    return SpotifyOAuth(
        client_id=config.SPOTIPY_CLIENT_ID,
        client_secret=config.SPOTIPY_CLIENT_SECRET,
        redirect_uri=config.SPOTIPY_REDIRECT_URI,
        scope=scope,
        cache_handler=cache,
        open_browser=False,
        show_dialog=False,
    )


def check_auth(
    stored_token: dict | None,
) -> tuple[bool, SpotifyOAuth, Optional[CacheHandler]]:
    cache_handler = CacheHandler()
    if stored_token:
        cache_handler.save_token_to_cache(stored_token)
    auth_manager = auther(cache_handler)
    new_token = cache_handler.get_cached_token()
    authed = new_token is not None and auth_manager.validate_token(new_token)
    return authed, auth_manager, cache_handler


def recommendations(spotify: Spotify, album_id) -> dict[str, list[dict]]:
    album_tracks = spotify.album_tracks(album_id)
    album_tracks_ids = [track["id"] for track in album_tracks["items"]][:5]
    recommended_tracks = spotify.recommendations(
        seed_tracks=album_tracks_ids, country="NO", limit=20
    )
    albums = _get_user_albums(spotify)
    album_ids = {album["id"] for album in albums}
    album_names = {album["name"] for album in albums}
    recommended_albums = []

    for track in recommended_tracks["tracks"]:
        if (
            (track["album"]["album_type"] == "ALBUM")
            and (track["album"].get("is_playable") is not False)
            and (track["album"]["id"] not in album_ids)
            and (track["album"]["name"] not in album_names)
        ):
            recommended_albums.append(track["album"])
            album_ids.add(track["id"])
    recommended_albums = sorted(
        recommended_albums, key=itemgetter("release_date"), reverse=True
    )[:10]

    return {"recommended_albums": recommended_albums}


def _get_user_albums(spotify: Spotify):
    album_data = []
    results = spotify.current_user_saved_albums(limit=20)
    album_data.extend(results["items"])
    while results["next"]:
        results = spotify.next(results)
        album_data.extend(results["items"])
    albums = [
        {
            "name": album["album"]["name"],
            "id": album["album"]["id"],
            "uri": album["album"]["uri"],
            "artists": album["album"]["artists"],
            "release_date": album["album"]["release_date"],
            "images": album["album"]["images"],
            "added_at": album["added_at"],
        }
        for album in album_data
    ]
    return albums


def albums(spotify: Spotify) -> dict[str, list[dict]]:
    albums = _get_user_albums(spotify)
    by_artist = sorted(
        albums,
        key=lambda album: (
            album["artists"][0]["name"].lower().removeprefix("the "),
            album["release_date"],
        ),
    )
    by_date = sorted(albums, key=itemgetter("added_at"), reverse=True)[:10]

    artist_ids = list({album["artists"][0]["id"] for album in albums})
    random.shuffle(artist_ids)
    artist_ids = artist_ids[:5]
    recommended_tracks = spotify.recommendations(
        seed_artists=artist_ids, country="NO", limit=20
    )
    album_ids = {album["id"] for album in albums}
    recommended_albums = [
        track["album"]
        for track in recommended_tracks["tracks"]
        if track["album"]["id"] not in album_ids
    ]

    data = {
        "all_albums": by_artist,
        "recent_albums": by_date,
        "recommended_albums": recommended_albums,
    }
    return data


def add_album(spotify: Spotify, album_id: str) -> None:
    spotify.current_user_saved_albums_add([album_id])


def remove_album(spotify: Spotify, album_id: str) -> None:
    spotify.current_user_saved_albums_delete([album_id])


class AlbumResponse(TypedDict):
    added_at: str  # "2021-05-13T07:00:09Z"
    album: Album


class Album(TypedDict):
    album_type: str
    artists: list[Artist]
    images: list[AlbumImage]
    href: str
    id: str
    name: str
    uri: str
    type: str
    release_date: str  # "2019-03-22",
    release_date_precision: str  # "day",


class Artist(TypedDict):
    href: str
    id: str
    name: str
    type: str
    uri: str


class AlbumImage(TypedDict):
    height: int  # 640, 300, 64
    url: str
    width: int
