package core

import (
	context "context"
	"fmt"
	log "log"
	sort "sort"
	strings "strings"
	time "time"

	spotify "github.com/zmb3/spotify/v2"
)

func getAllAlbums(client *spotify.Client) ([]spotify.SavedAlbum, error) {
	limit := 50
	albums, err := client.CurrentUsersAlbums(context.Background(), spotify.Limit(limit))
	if err != nil {
		return nil, err
	}

	var allAlbums []spotify.SavedAlbum = albums.Albums
	log.Println(allAlbums[0].Name)

	for albums.Next != "" {
		offset := albums.Offset + limit
		log.Println(offset)
		albums, err = client.CurrentUsersAlbums(context.Background(), spotify.Offset(offset))
		if err != nil {
			return nil, err
		}
		log.Println(albums.Albums[0].Name)
		allAlbums = append(allAlbums, albums.Albums...)
	}
	log.Println("allAlbums OK")
	return allAlbums, nil
}

func sortAlbumsByArtistDate(albums []spotify.SavedAlbum) []spotify.SavedAlbum {
	var sortedAlbums = make([]spotify.SavedAlbum, len(albums))
	copy(sortedAlbums, albums)
	sort.Slice(sortedAlbums, func(i, j int) bool {
		thisAlbum := sortedAlbums[i]
		thatAlbum := sortedAlbums[j]
		thisArtist := strings.ToLower(strings.TrimPrefix(thisAlbum.Artists[0].Name, `The `))
		thatArtist := strings.ToLower(strings.TrimPrefix(thatAlbum.Artists[0].Name, `The `))

		if thisArtist != thatArtist {
			return thisArtist < thatArtist
		} else {
			return thisAlbum.ReleaseDateTime().Before(thatAlbum.ReleaseDateTime())
		}
	})
	return sortedAlbums
}

func sortAlbumsByAdded(albums []spotify.SavedAlbum) []spotify.SavedAlbum {
	var sortedAlbums = make([]spotify.SavedAlbum, len(albums))
	copy(sortedAlbums, albums)
	sort.Slice(sortedAlbums, func(i, j int) bool {
		thisAlbumAdded, err := time.Parse(spotify.TimestampLayout, sortedAlbums[i].AddedAt)
		if err != nil {
			return false
		}
		thatAlbumAdded, err := time.Parse(spotify.TimestampLayout, sortedAlbums[j].AddedAt)
		if err != nil {
			return false
		}
		return thisAlbumAdded.After(thatAlbumAdded)
	})
	return sortedAlbums
}

func filterRecommendations(recommendedAlbums []spotify.SimpleAlbum, allAlbums []spotify.SavedAlbum) []spotify.SimpleAlbum {
	var ids map[spotify.ID]bool = make(map[spotify.ID]bool)
	var names map[string]bool = make(map[string]bool)
	for _, album := range allAlbums {
		ids[album.ID] = true
		names[album.Name] = true
	}

	var filtteredAlbums []spotify.SimpleAlbum
	for _, album := range recommendedAlbums {
		if ids[album.ID] {
			log.Println("Filtering, 0: " + album.Name)
			continue
		}
		if names[album.Name] {
			log.Println("Filtering, 1: " + album.Name)
			continue
		}
		if album.AlbumType != "ALBUM" {
			log.Println("Filtering, 2: " + album.Name + " " + album.AlbumType)
			continue
		}

		filtteredAlbums = append(filtteredAlbums, album)
	}
	return filtteredAlbums
}

func getRecommendedAlbums(client *spotify.Client, trackIds []spotify.ID) ([]spotify.SimpleAlbum, error) {
	seeds := spotify.Seeds{Tracks: trackIds}
	recommendedTracks, err := client.GetRecommendations(context.Background(), seeds, spotify.NewTrackAttributes(), spotify.Country("NO"))
	if err != nil {
		return nil, err
	}
	var recommendedAlbums []spotify.SimpleAlbum
	for _, track := range recommendedTracks.Tracks {
		recommendedAlbums = append(recommendedAlbums, track.Album)
	}
	log.Println("recommendedAlbums OK")
	return recommendedAlbums, nil
}

type MinimalAlbum struct {
	Name    string                 `json:"name"`
	Artists []spotify.SimpleArtist `json:"artists"`
	ID      string                 `json:"id"`
	Uri     string                 `json:"uri"`
	Images  []spotify.Image        `json:"images"`
}

type AlbumsResponse struct {
	AllAlbums         []MinimalAlbum `json:"all_albums"`
	RecentAlbums      []MinimalAlbum `json:"recent_albums"`
	RecommendedAlbums []MinimalAlbum `json:"recommended_albums"`
}

func minimizeAlbum(name string, artists []spotify.SimpleArtist, id spotify.ID, uri spotify.URI, images []spotify.Image) MinimalAlbum {
	return MinimalAlbum{
		Name:    name,
		Artists: artists,
		ID:      string(id),
		Uri:     string(uri),
		Images:  images,
	}
}

func minimizeSimpleAlbums(albums []spotify.SimpleAlbum) []MinimalAlbum {
	var minimizedAlbums []MinimalAlbum
	for _, album := range albums {
		minimizedAlbums = append(minimizedAlbums, minimizeAlbum(album.Name, album.Artists, album.ID, album.URI, album.Images))
	}
	return minimizedAlbums
}

func minimizeSavedAlbums(albums []spotify.SavedAlbum) []MinimalAlbum {
	var minimizedAlbums []MinimalAlbum
	for _, album := range albums {
		minimizedAlbums = append(minimizedAlbums, minimizeAlbum(album.Name, album.Artists, album.ID, album.URI, album.Images))
	}
	return minimizedAlbums
}

func Albums(client *spotify.Client) (*AlbumsResponse, error) {

	allAlbums, err := getAllAlbums(client)
	if err != nil {
		return nil, err
	}

	fmt.Println(allAlbums[0].Name)
	sortedByArtist := sortAlbumsByArtistDate(allAlbums)
	fmt.Println(sortedByArtist[0].Name)

	sortedByAdded := sortAlbumsByAdded(allAlbums)
	fmt.Println(sortedByAdded[0].Name)

	var recommendationTrackIds []spotify.ID
	for _, album := range sortedByAdded[:5] {
		recommendationTrackIds = append(recommendationTrackIds, album.Tracks.Tracks[0].ID)
	}

	recommendedAlbums, err := getRecommendedAlbums(client, recommendationTrackIds)
	if err != nil {
		return nil, err
	}

	filteredRecommendations := filterRecommendations(recommendedAlbums, allAlbums)

	response := AlbumsResponse{
		AllAlbums:         minimizeSavedAlbums(sortedByArtist),
		RecentAlbums:      minimizeSavedAlbums(sortedByAdded[:10]),
		RecommendedAlbums: minimizeSimpleAlbums(filteredRecommendations),
	}
	return &response, nil
}

type RecommendationsResponse struct {
	RecommendedAlbums []MinimalAlbum `json:"recommended_albums"`
}

func Recommendations(client *spotify.Client, seedAlbumId spotify.ID) (*RecommendationsResponse, error) {

	recommendedAlbumsChan := make(chan []spotify.SimpleAlbum)
	recommendedAlbumsErrChan := make(chan error)

	allAlbumsChan := make(chan []spotify.SavedAlbum)
	allAlbumsErrChan := make(chan error)

	go func() {
		album, err := client.GetAlbum(context.Background(), seedAlbumId)
		if err != nil {
			recommendedAlbumsChan <- nil
			recommendedAlbumsErrChan <- err
			return
		}

		var trackIds []spotify.ID
		for _, track := range album.Tracks.Tracks[:5] {
			trackIds = append(trackIds, track.ID)
		}
		albums, err := getRecommendedAlbums(client, trackIds)
		recommendedAlbumsChan <- albums
		recommendedAlbumsErrChan <- err
	}()

	go func() {
		albums, err := getAllAlbums(client)
		allAlbumsChan <- albums
		allAlbumsErrChan <- err
	}()

	recommendedAlbums := <-recommendedAlbumsChan
	err := <-recommendedAlbumsErrChan
	if err != nil {
		return nil, err
	}

	allAlbums := <-allAlbumsChan
	err = <-allAlbumsErrChan
	if err != nil {
		return nil, err
	}

	filteredRecommendations := filterRecommendations(recommendedAlbums, allAlbums)

	response := RecommendationsResponse{RecommendedAlbums: minimizeSimpleAlbums(filteredRecommendations)}
	return &response, nil
}
