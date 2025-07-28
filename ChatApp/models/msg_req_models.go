package models

import (
	"encoding/json"
)

type BaseMsgReq struct {
	ReqType string          `json:"reqType"`
	Payload json.RawMessage `json:"payload"`
}

type DeleteMsgReqPayload struct {
	MessageId string `json:"msgId"`
	Author    string `json:"author"`
}

type EditMsgReqPayload struct {
	MessageId string `json:"msgId"`
	Author    string `json:"author"`
	Content   string `json:"content"`
}
