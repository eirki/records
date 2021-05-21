import os
from typing import Final

from dotenv import load_dotenv

load_dotenv()
SPOTIPY_CLIENT_ID: Final = os.environ["SPOTIPY_CLIENT_ID"]
SPOTIPY_CLIENT_SECRET: Final = os.environ["SPOTIPY_CLIENT_SECRET"]
SPOTIPY_REDIRECT_URI: Final = os.environ["SPOTIPY_REDIRECT_URI"]
