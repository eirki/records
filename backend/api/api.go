package api

import (
	context "context"
	json "encoding/json"
	"fmt"
	log "log"
	http "net/http"
	"strconv"
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

func PaginatedAlbumsEndpoint(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.URL.Path)
	paths := strings.Split(r.URL.Path, "/")
	fmt.Println(paths)
	offset, err := strconv.Atoi(paths[2])
	if err != nil {
		log.Println("Error parsing offset", err)
		http.Error(w, "Error parsing offset", http.StatusForbidden)
		return
	}
	client, err := auth.InitSpotifyClient(r, w)
	if err != nil {
		log.Println("Couldn't auth", err)
		http.Error(w, "Couldn't auth", http.StatusForbidden)
		return
	}
	response, err := core.PaginatedAlbums(client, offset)
	if err != nil {
		log.Println("Failure getting albums page", err)
		http.Error(w, "Failure getting albums page", http.StatusForbidden)
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

func RandomSavedAlbumEndpoint(w http.ResponseWriter, r *http.Request) {
	paths := strings.Split(r.URL.Path, "/")
	total, err := strconv.Atoi(paths[2])
	if err != nil {
		log.Println("Error parsing total", err)
		http.Error(w, "Error parsing total", http.StatusForbidden)
		return
	}
	client, err := auth.InitSpotifyClient(r, w)
	if err != nil {
		log.Println("Couldn't auth", err)
		http.Error(w, "Couldn't auth", http.StatusForbidden)
		return
	}

	response, err := core.RandomSavedAlbum(client, total)
	if err != nil {
		log.Println("Failure getting saved album", err)
		http.Error(w, "Failure getting saved album", http.StatusForbidden)
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
	fmt.Println(paths)
	seedAlbumId := spotify.ID(paths[2])

	client, err := auth.InitSpotifyClient(r, w)
	if err != nil {
		log.Println("Couldn't auth", err)
		http.Error(w, "Couldn't auth", http.StatusForbidden)
		return
	}
	response, err := core.Recommendations(client, seedAlbumId)
	if err != nil {
		log.Println("Failure getting recommendations", err)
		http.Error(w, "Failure getting recommendations", 400)
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
