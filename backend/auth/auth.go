package auth

import (
	base64 "encoding/base64"
	json "encoding/json"
	log "log"
	http "net/http"
	os "os"

	spotify "github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	oauth2 "golang.org/x/oauth2"
)

var scopes = []string{
	"user-library-read",
	"user-library-modify",
	"user-read-playback-state",
	"user-modify-playback-state",
	"user-read-currently-playing",
}

const State = "recordsstate"

func InitSpotifyAuth() *spotifyauth.Authenticator {
	auth := spotifyauth.New(spotifyauth.WithRedirectURL(os.Getenv("SPOTIFY_REDIRECT_URI")), spotifyauth.WithScopes(scopes...))
	return auth
}

func InitSpotifyClient(r *http.Request) (*spotify.Client, error) {
	cookie, err := r.Cookie("spotify-token")
	if err != nil {
		log.Println("No cookie")
		return nil, err
	}
	tokenBase64 := cookie.Value
	tokenJsonBytes, err := base64.StdEncoding.DecodeString(tokenBase64)
	if err != nil {
		log.Println("Couldn't decode")
		return nil, err
	}

	var token oauth2.Token
	err = json.Unmarshal(tokenJsonBytes, &token)
	if err != nil {
		log.Println("Couldn't unmarshal")
		return nil, err
	}

	auth := InitSpotifyAuth()

	tokenPtr, err := auth.RefreshToken(r.Context(), &token)
	if err != nil {
		log.Println("Couldn't refresh")
		return nil, err
	}

	httpClient := auth.Client(r.Context(), tokenPtr)
	client := spotify.New(httpClient)
	return client, nil
}
