package api

import (
	context "context"
	json "encoding/json"
	log "log"
	http "net/http"
	strings "strings"

	spotify "github.com/zmb3/spotify/v2"

	auth "records/backend/auth"
	core "records/backend/core"
)

func CompleteAuthEndpoint(w http.ResponseWriter, r *http.Request) {
	authenticator := auth.InitSpotifyAuth()
	token, err := authenticator.Token(r.Context(), auth.State, r)
	if err != nil {
		log.Println("Couldn't get token", err)
		http.Error(w, "Couldn't get token", http.StatusForbidden)
		return
	}

	if st := r.FormValue("state"); st != auth.State {
		http.NotFound(w, r)
		return
	}

	err = auth.SetTokenCookie(w, token)
	if err != nil {
		log.Println("Couldn't set token", err)
		http.Error(w, "Couldn't set token", http.StatusForbidden)
	}

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

type AuthedResponse struct {
	Success bool `json:"success"`
}

func AuthedEndpoint(w http.ResponseWriter, r *http.Request) {
	client, err := auth.InitSpotifyClient(r, w)
	if err != nil {
		log.Println("Couldn't auth", err)
		http.Error(w, "Couldn't auth", http.StatusForbidden)
		return
	}
	_, err = client.CurrentUser(r.Context())
	if err != nil {
		log.Println("Couldn't get user", err)
		http.Error(w, "Couldn't get user", http.StatusForbidden)
		return
	}
	json.NewEncoder(w).Encode(AuthedResponse{Success: true})
}

func AlbumsEndpoint(w http.ResponseWriter, r *http.Request) {
	client, err := auth.InitSpotifyClient(r, w)
	if err != nil {
		log.Println("Couldn't auth", err)
		http.Error(w, "Couldn't auth", http.StatusForbidden)
		return
	}

	response, err := core.Albums(client)
	if err != nil {
		log.Println("Failure", err)
		http.Error(w, "Failure", http.StatusForbidden)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	// json.NewEncoder(w).Encode(response)
	asJson, err := json.MarshalIndent(response, "", "    ")
	if err != nil {
		log.Println("Couldn't serialize", err)
		http.Error(w, "Couldn't serialize", http.StatusForbidden)
		return
	}
	w.Write(asJson)

}

func RecommendationEndpoint(w http.ResponseWriter, r *http.Request) {
	paths := strings.Split(r.URL.Path, "/")
	seedAlbumId := spotify.ID(paths[2])

	client, err := auth.InitSpotifyClient(r, w)
	if err != nil {
		log.Println("Couldn't auth", err)
		http.Error(w, "Couldn't auth", http.StatusForbidden)
		return
	}
	response, err := core.Recommendations(client, seedAlbumId)
	if err != nil {
		log.Println("Failure", err)
		http.Error(w, "Failure", 400)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	// json.NewEncoder(w).Encode(response)
	asJson, err := json.MarshalIndent(response, "", "    ")
	if err != nil {
		log.Println("Couldn't serialize", err)
		http.Error(w, "Couldn't serialize", 400)
		return
	}
	w.Write(asJson)
	log.Println("Done")
}

func AddAlbumEndpoint(w http.ResponseWriter, r *http.Request) {
	paths := strings.Split(r.URL.Path, "/")
	albumId := spotify.ID(paths[2])
	client, err := auth.InitSpotifyClient(r, w)
	if err != nil {
		log.Println("Couldn't auth", err)
		http.Error(w, "Couldn't auth", http.StatusForbidden)
		return
	}
	err = client.AddAlbumsToLibrary(context.Background(), albumId)
	if err != nil {
		log.Println("Couldn't add album", err)
		http.Error(w, "Couldn't add album", 400)
		return
	}
	w.WriteHeader(200)
	w.Write([]byte("done"))

}
func RemoveAlbumEndpoint(w http.ResponseWriter, r *http.Request) {
	paths := strings.Split(r.URL.Path, "/")
	albumId := spotify.ID(paths[2])
	client, err := auth.InitSpotifyClient(r, w)
	if err != nil {
		log.Println("Couldn't auth", err)
		http.Error(w, "Couldn't auth", http.StatusForbidden)
		return
	}

	err = client.RemoveAlbumsFromLibrary(context.Background(), albumId)
	if err != nil {
		log.Println("Couldn't remove album", err)
		http.Error(w, "Couldn't remove album", 400)
		return
	}
	w.WriteHeader(200)
	w.Write([]byte("done"))

}
