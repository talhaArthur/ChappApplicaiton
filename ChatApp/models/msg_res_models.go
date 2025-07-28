package models

type DeleteMsgResPayload struct {
	MessageId string `json:"msgId"`
}

type EditMsgResPayload struct {
	MessageId string `json:"msgId"`
	Content   string `json:"content"`
}
