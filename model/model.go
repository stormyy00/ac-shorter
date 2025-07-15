package model

type Link struct {
	ID         string `json:"id"`
	LinkID     string `json:"linkId"`
	Original   string `json:"original"`
	ShortenUrl string `json:"shortenUrl"`
	Clicks     int    `json:"clicks"`
}

type Folder struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Links []Link `json:"links"`
}
