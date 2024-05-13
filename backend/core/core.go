package core

import (
	context "context"
	rand "math/rand/v2"

	spotify "github.com/zmb3/spotify/v2"
)

func getRecommendedAlbums(client *spotify.Client, trackIds []spotify.ID) ([]spotify.SimpleAlbum, error) {
	seeds := spotify.Seeds{Tracks: trackIds}
	recommendedTracks, err := client.GetRecommendations(
		context.Background(),
		seeds,
		spotify.NewTrackAttributes(),
		spotify.Country("NO"),
		spotify.Limit(50),
	)
	if err != nil {
		return nil, err
	}
	var recommendedAlbums []spotify.SimpleAlbum
	for _, track := range recommendedTracks.Tracks {
		recommendedAlbums = append(recommendedAlbums, track.Album)
	}
	// log.Println("recommendedAlbums OK")
	return recommendedAlbums, nil
}

type MinimalAlbum struct {
	Name        string                 `json:"name"`
	Artists     []spotify.SimpleArtist `json:"artists"`
	ID          string                 `json:"id"`
	Uri         string                 `json:"uri"`
	Images      []spotify.Image        `json:"images"`
	AddedAt     string                 `json:"addedAt"`
	ReleaseDate string                 `json:"releaseDate"`
}

type AlbumsResponse struct {
	AllAlbums         []MinimalAlbum `json:"all_albums"`
	RecentAlbums      []MinimalAlbum `json:"recent_albums"`
	RecommendedAlbums []MinimalAlbum `json:"recommended_albums"`
}

func minimizeAlbum(name string, artists []spotify.SimpleArtist, id spotify.ID, uri spotify.URI, images []spotify.Image, added_at string, releaseDate string) MinimalAlbum {
	return MinimalAlbum{
		Name:        name,
		Artists:     artists,
		ID:          string(id),
		Uri:         string(uri),
		Images:      images,
		AddedAt:     added_at,
		ReleaseDate: releaseDate,
	}
}

func minimizeSimpleAlbums(albums []spotify.SimpleAlbum) []MinimalAlbum {
	var minimizedAlbums []MinimalAlbum
	for _, album := range albums {
		minimizedAlbums = append(minimizedAlbums, minimizeAlbum(album.Name, album.Artists, album.ID, album.URI, album.Images, "", album.ReleaseDate))
	}
	return minimizedAlbums
}

func minimizeSavedAlbums(albums []spotify.SavedAlbum) []MinimalAlbum {
	var minimizedAlbums []MinimalAlbum
	for _, album := range albums {
		minimizedAlbums = append(minimizedAlbums, minimizeAlbum(album.Name, album.Artists, album.ID, album.URI, album.Images, album.AddedAt, album.ReleaseDate))
	}
	return minimizedAlbums
}

type RecommendationsResponse struct {
	RecommendedAlbums []MinimalAlbum `json:"recommended_albums"`
}

func Recommendations(client *spotify.Client, seedAlbumId spotify.ID) (*RecommendationsResponse, error) {
	album, err := client.GetAlbum(context.Background(), seedAlbumId)
	if err != nil {
		return nil, err
	}
	var trackIds []spotify.ID
	length := 5
	if len(album.Tracks.Tracks) < 5 {
		length = len(album.Tracks.Tracks)
	}
	for _, track := range album.Tracks.Tracks[:length] {
		trackIds = append(trackIds, track.ID)
	}
	albums, err := getRecommendedAlbums(client, trackIds)
	if err != nil {
		return nil, err
	}
	response := RecommendationsResponse{RecommendedAlbums: minimizeSimpleAlbums(albums)}
	return &response, nil
}

type PaginatedAlbumsResponse struct {
	Albums  []MinimalAlbum `json:"albums"`
	Offset  int            `json:"offset"`
	HasNext bool           `json:"has_next"`
	Total   int            `json:"total"`
}

func PaginatedAlbums(client *spotify.Client, offset int) (*PaginatedAlbumsResponse, error) {
	limit := 50
	albums, err := client.CurrentUsersAlbums(context.Background(), spotify.Offset(offset), spotify.Limit(limit))
	if err != nil {
		return nil, err
	}
	response := PaginatedAlbumsResponse{
		Albums:  minimizeSavedAlbums(albums.Albums),
		Offset:  albums.Offset,
		HasNext: albums.Next != "",
		Total:   albums.Total,
	}
	return &response, nil
}

func RandomSavedAlbum(client *spotify.Client, total int) (*MinimalAlbum, error) {
	selectedAlbumI := rand.IntN(total)
	selectedAlbumPage, err := client.CurrentUsersAlbums(context.Background(), spotify.Offset(selectedAlbumI), spotify.Limit(1))
	if err != nil {
		return nil, err
	}
	selectedAlbum := selectedAlbumPage.Albums[0]
	minimalAlbum := minimizeAlbum(
		selectedAlbum.Name,
		selectedAlbum.Artists,
		selectedAlbum.ID,
		selectedAlbum.URI,
		selectedAlbum.Images,
		selectedAlbum.AddedAt,
		selectedAlbum.ReleaseDate,
	)
	return &minimalAlbum, nil
}
