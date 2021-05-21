from __future__ import annotations

import json
import os
from typing import Optional, TypedDict

import spotipy
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth

from . import config

scope = "user-library-read"


class CacheHandler(spotipy.cache_handler.CacheHandler):
    def __init__(self):
        cache_path = ".cache"
        username = "default_username"
        cache_path += "-" + str(username)
        self.cache_path = cache_path

    def get_cached_token(self) -> Optional[str]:
        print("get_cached_token")
        if not os.path.exists(self.cache_path):
            return None
        with open(self.cache_path) as f:
            token_info = json.load(f)
        return token_info

    def save_token_to_cache(self, token_info: str) -> None:
        print("save_token_to_cache")
        with open(self.cache_path, "w") as file_:
            file_.write(json.dumps(token_info))


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


def check_auth() -> tuple[bool, SpotifyOAuth]:
    cache_handler = CacheHandler()
    auth_manager = auther(cache_handler)
    token = cache_handler.get_cached_token()
    authed = token is not None and auth_manager.validate_token(token)
    return authed, auth_manager


def albums(spotify: Spotify) -> list:
    results = spotify.current_user_saved_albums(limit=1, offset=4)
    return [
        {
            "name": album["album"]["name"],
            "artists": album["album"]["artists"],
            "release_date": album["album"]["release_date"],
            "images": album["album"]["images"],
            "added_at": album["added_at"],
        }
        for album in results["items"]
    ]


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
