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

func InitSpotifyClient(r *http.Request, w http.ResponseWriter) (*spotify.Client, error) {
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

	err = SetTokenCookie(w, tokenPtr)
	if err != nil {
		log.Println("Couldn't set token")
		return nil, err
	}

	httpClient := auth.Client(r.Context(), tokenPtr)
	client := spotify.New(httpClient)
	return client, nil
}

func SetTokenCookie(w http.ResponseWriter, token *oauth2.Token) error {
	tokenJsonBytes, err := json.Marshal(token)
	if err != nil {
		return err
	}
	tokenBase64 := base64.StdEncoding.EncodeToString(tokenJsonBytes)

	cookie := http.Cookie{
		Name:     "spotify-token",
		Value:    tokenBase64,
		Path:     "/",
		MaxAge:   3600,
		HttpOnly: true,
		Secure:   true,
		// SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &cookie)
	return nil
}
