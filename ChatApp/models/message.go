package models

type Message struct {
	ID      string `json:"id"`
	Author  string `json:"author"`
	Content string `json:"content"`
	Time    int    `json:"time"`
}
