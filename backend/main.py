import sys

from fastapi import FastAPI, Request
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from spotipy import Spotify

from . import api, dev

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


@app.get("/auth")
async def auth():
    authed, auth_manager = api.check_auth()
    if not authed:
        return RedirectResponse(auth_manager.get_authorize_url())
    else:
        return RedirectResponse("/")


@app.get("/redirect")
async def redirect(code: str) -> RedirectResponse:
    auth_manager = api.auther(cache=api.CacheHandler())
    auth_manager.get_access_token(code)
    return RedirectResponse("/")


@app.get("/")
async def root(request: Request):
    authed, auth_manager = api.check_auth()
    if not authed:
        return RedirectResponse(auth_manager.get_authorize_url())
    spotify = Spotify(auth_manager=auth_manager)
    albums = api.albums(spotify)
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "data": albums},
    )


@app.get("/play")
async def play(uri: str):
    authed, auth_manager = api.check_auth()
    if not authed:
        return JSONResponse({"success": False}, status_code=500)
    spotify = Spotify(auth_manager=auth_manager)
    api.play(spotify, uri)
    return JSONResponse({"success": True}, status_code=200)
