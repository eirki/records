import json
import sys
from typing import Optional

from fastapi import Cookie, FastAPI, Request
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from spotipy import Spotify

from . import api, dev, version

DEBUG_MODE = "--reload" in sys.argv

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=500)
app.mount("/dist", StaticFiles(directory="frontend/dist"), name="dist")
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend/templates")

if DEBUG_MODE:
    app.mount(
        "/node_modules", StaticFiles(directory="node_modules"), name="node_modules"
    )
    app.include_router(dev.router)


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
        cache.delete_cached_token()
    return response


@app.get("/play")
async def play(uri: str, spotify_token: Optional[str] = Cookie(None)):
    spotify_token_j = json.loads(spotify_token) if spotify_token else None
    authed, auth_manager, cache = api.check_auth(spotify_token_j)
    if not authed:
        return RedirectResponse(auth_manager.get_authorize_url())
    spotify = Spotify(auth_manager=auth_manager)
    success, message = api.play(spotify, uri)
    status_code = 200 if success else 500
    response = JSONResponse(
        {"success": success, "message": message}, status_code=status_code
    )
    if cache:
        set_token_cookie(response, cache)
        cache.delete_cached_token()
    return response


@app.get("/devices")
async def devices(spotify_token: Optional[str] = Cookie(None)):
    spotify_token_j = json.loads(spotify_token) if spotify_token else None
    authed, auth_manager, cache = api.check_auth(spotify_token_j)
    spotify = Spotify(auth_manager=auth_manager)
    return spotify.devices()
