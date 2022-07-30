import json
import sys
from typing import Optional

from fastapi import Cookie, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from spotipy import Spotify

from . import api, version

DEBUG_MODE = "--reload" in sys.argv

app = FastAPI()
app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
templates = Jinja2Templates(directory="frontend/dist")


@app.route("/version")
def version_page(spotify_token: Optional[str] = Cookie(None)) -> JSONResponse:
    return JSONResponse({"version": version.version})


@app.get("/redirect")
async def redirect(code: str) -> RedirectResponse:
    cache = api.CacheHandler()
    auth_manager = api.auther(cache=cache)
    auth_manager.get_access_token(code)
    response = RedirectResponse("/")
    set_token_cookie(response, cache)
    return response


def set_token_cookie(response, cache: api.CacheHandler) -> None:
    token = cache.get_cached_token()
    response.set_cookie(key="spotify_token", value=json.dumps(token))


@app.get("/")
async def root(request: Request, spotify_token: Optional[str] = Cookie(None)):
    spotify_token_j = json.loads(spotify_token) if spotify_token else None
    authed, auth_manager, cache = api.check_auth(spotify_token_j)
    if not authed:
        return RedirectResponse(auth_manager.get_authorize_url())
    spotify = Spotify(auth_manager=auth_manager)
    albums = api.albums(spotify)
    response = templates.TemplateResponse(
        "index.html",
        {"request": request, "data": albums},
    )
    if cache:
        set_token_cookie(response, cache)
    return response


@app.get("/albums")
async def albums(spotify_token: Optional[str] = Cookie(None)):
    spotify_token_j = json.loads(spotify_token) if spotify_token else None
    authed, auth_manager, cache = api.check_auth(spotify_token_j)
    if not authed:
        return RedirectResponse(auth_manager.get_authorize_url())
    spotify = Spotify(auth_manager=auth_manager)
    albums = api.albums(spotify)
    response = JSONResponse(content=albums)
    if cache:
        set_token_cookie(response, cache)
        cache.delete_cached_token()
    return response


@app.get("/add_album/{album_id}")
async def add_album(album_id: str, spotify_token: Optional[str] = Cookie(None)):
    spotify_token_j = json.loads(spotify_token) if spotify_token else None
    authed, auth_manager, cache = api.check_auth(spotify_token_j)
    if not authed:
        raise HTTPException(status_code=403, detail="Authentication failed")
    spotify = Spotify(auth_manager=auth_manager)
    api.add_album(spotify, album_id)
    response = JSONResponse(content={"success": True})
    if cache:
        set_token_cookie(response, cache)
        cache.delete_cached_token()
    return response


@app.get("/remove_album/{album_id}")
async def remove_album(album_id: str, spotify_token: Optional[str] = Cookie(None)):
    spotify_token_j = json.loads(spotify_token) if spotify_token else None
    authed, auth_manager, cache = api.check_auth(spotify_token_j)
    if not authed:
        raise HTTPException(status_code=403, detail="Authentication failed")
    spotify = Spotify(auth_manager=auth_manager)
    api.remove_album(spotify, album_id)
    response = JSONResponse(content={"success": True})
    if cache:
        set_token_cookie(response, cache)
        cache.delete_cached_token()
    return response


@app.get("/authed")
async def authed(spotify_token: Optional[str] = Cookie(None)):
    spotify_token_j = json.loads(spotify_token) if spotify_token else None
    authed, auth_manager, cache = api.check_auth(spotify_token_j)
    success = authed is not None
    res = {"success": success}
    response = JSONResponse(content=res)
    if cache:
        set_token_cookie(response, cache)
        cache.delete_cached_token()
    return res
