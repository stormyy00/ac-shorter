package model

type link struct {
	id         string
	linkId     string
	original   string
	shortenUrl string
	clicks     int
}

type folder struct {
	id    string
	name  string
	links []link
}
