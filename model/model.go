package model

import "time"

type Link struct {
	ID         int64     `json:"id"`
	LinkID     string    `json:"linkId"`
	Original   string    `json:"original"`
	ShortenUrl string    `json:"shortenUrl"`
	SlugUrl    string    `json:"slugUrl"`
	Clicks     int       `json:"clicks"`
	CreatedAt  time.Time `json:"createdAt"`
}

type Folder struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Links []Link `json:"links"`
}

type Statistics struct {
	Month       string `json:"month"`
	SlugUrl     string `json:"slug_url,omitempty"`
	TotalClicks int    `json:"total_clicks"`
}
