package main

import (
	fmt "fmt"
	log "log"
	http "net/http"
	"os"

	godotenv "github.com/joho/godotenv"

	api "records/backend/api"
	auth "records/backend/auth"
)

func main() {
	err := godotenv.Load(".env.local", ".env")
	if err != nil {
		log.Println("No .env file found")
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		_, err := auth.InitSpotifyClient(r, w)
		if err != nil {
			authenticator := auth.InitSpotifyAuth()
			url := authenticator.AuthURL(auth.State)
			http.Redirect(w, r, url, http.StatusTemporaryRedirect)
		} else {
			http.ServeFile(w, r, "./frontend/dist/index.html")

		}
	})
	http.HandleFunc("/auth", func(w http.ResponseWriter, r *http.Request) {
		authenticator := auth.InitSpotifyAuth()
		url := authenticator.AuthURL(auth.State)
		http.Redirect(w, r, url, http.StatusTemporaryRedirect)
	})
	http.HandleFunc("/assets/", func(w http.ResponseWriter, r *http.Request) {
		path := "./frontend/dist" + r.URL.Path
		http.ServeFile(w, r, path)
	})
	http.HandleFunc("/redirect", api.CompleteAuthEndpoint)
	http.HandleFunc("/authed", api.AuthedEndpoint)
	http.HandleFunc("/paginated_albums/", api.PaginatedAlbumsEndpoint)
	http.HandleFunc("/random_saved_album/", api.RandomSavedAlbumEndpoint)
	http.HandleFunc("/recommendations/", api.RecommendationEndpoint)
	http.HandleFunc("/add_album/", api.AddAlbumEndpoint)
	http.HandleFunc("/remove_album/", api.RemoveAlbumEndpoint)
	port := os.Getenv("PORT")
	fmt.Printf("Ready to serve on :%s", port)
	err = http.ListenAndServe(fmt.Sprintf(":%s", port), nil)
	if err != nil {
		log.Println(err)
	}
}
