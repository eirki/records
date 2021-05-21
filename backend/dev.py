import datetime as dt
import json
from pathlib import Path
import typing as t
from urllib.parse import quote_plus, urlencode

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter()
templates = Jinja2Templates(directory="frontend/templates")


@router.get("/component/{component}")
async def component(
    request: Request, component: str, data_file: t.Optional[str] = None
):
    if data_file is not None:
        with open(
            (Path("frontend/component-data/") / component / data_file).with_suffix(
                ".json"
            )
        ) as file_:
            data = json.load(file_)
    else:
        data = {}
    timestamp = (
        (Path("frontend/dist/components") / component)
        .with_suffix((".js"))
        .stat()
        .st_mtime
    )
    time = dt.datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")
    return templates.TemplateResponse(
        "component.html",
        {"request": request, "component": component, "data": data, "time": time},
    )


@router.get("/components")
async def component_list(request: Request):
    components = []
    for component in Path("frontend/dist/components").glob("*.js"):
        components.append(component.stem)
        data_folder = Path("frontend/component-data/") / component.stem
        if not data_folder.exists():
            continue
        for data_file in data_folder.glob("*.json"):
            params = urlencode({"data_file": data_file.stem})
            components.append(component.stem + "?" + params)
    components.sort()
    return templates.TemplateResponse(
        "components.html", {"request": request, "components": components},
    )
