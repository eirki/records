package main

import (
	fmt "fmt"
	log "log"
	http "net/http"

	godotenv "github.com/joho/godotenv"

	api "records/backend/api"
	auth "records/backend/auth"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		_, err := auth.InitSpotifyClient(r)
		if err != nil {
			authenticator := auth.InitSpotifyAuth()
			url := authenticator.AuthURL(auth.State)
			http.Redirect(w, r, url, http.StatusTemporaryRedirect)
		} else {
			http.ServeFile(w, r, "./frontend/dist/index.html")

		}
	})
	http.HandleFunc("/assets/", func(w http.ResponseWriter, r *http.Request) {
		path := "./frontend/dist" + r.URL.Path
		http.ServeFile(w, r, path)
	})
	http.HandleFunc("/redirect", api.CompleteAuthEndpoint)
	http.HandleFunc("/authed", api.AuthedEndpoint)
	http.HandleFunc("/albums", api.AlbumsEndpoint)
	http.HandleFunc("/recommendations/", api.RecommendationEndpoint)
	http.HandleFunc("/add_album/", api.AddAlbumEndpoint)
	http.HandleFunc("/remove_album/", api.RemoveAlbumEndpoint)
	fmt.Println("Ready to serve on :5006")
	err = http.ListenAndServe(":5006", nil)
	if err != nil {
		log.Println(err)
	}
}
