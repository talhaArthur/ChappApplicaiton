package handlers

import (
	"github.com/gofiber/contrib/websocket"

	"encoding/json"
	"fmt"
	"sync"

	"chatapp/models"
	"chatapp/storage"
)

type ResponseMessage struct {
	MsgType string `json:"msgType"`
	Payload any    `json:"payload"`
}

var activeSocketConnections = make(map[*websocket.Conn]bool)
var mutexLock = sync.Mutex{}

func SocketMessageHandler(c *websocket.Conn) {

	defer func() {
		removeConnection(c)
		c.Close()
	}()

	addConnection(c)

	var (
		mt  int
		msg []byte
		err error
	)
	for {
		if mt, msg, err = c.ReadMessage(); err != nil {
			fmt.Println("websocket error occurred upon reading :", err)
			break
		}

		handleMessageFromClient(mt, msg)
	}

}

func addConnection(conn *websocket.Conn) {

	mutexLock.Lock()

	activeSocketConnections[conn] = true

	mutexLock.Unlock()

}

func removeConnection(conn *websocket.Conn) {

	mutexLock.Lock()

	delete(activeSocketConnections, conn)

	mutexLock.Unlock()

}

func handleMessageFromClient(mt int, msg []byte) {

	switch mt {

	case websocket.TextMessage:

		req := new(models.BaseMsgReq)
		err := json.Unmarshal(msg, req)

		if err != nil {
			fmt.Printf("Error unmarshaling client msg %v\n", err)
			return
		}

		switch req.ReqType {

		case "create":
			chatMsg := new(models.Message)
			err := json.Unmarshal(req.Payload, chatMsg)

			if err != nil {
				fmt.Printf("Error unmarshaling client msg %v\n", err)
				return
			}

			err = storage.AddMessageToRedis(chatMsg)

			if err != nil {
				fmt.Printf("Error adding client message to redis %v\n", err)
				return
			}

			broadcastCreateMessageToAllClients(chatMsg)

		}

	default:
		fmt.Printf("No handler for message type %v\n", mt)

	}

}

func broadcastCreateMessageToAllClients(msg *models.Message) {
	json, err := createBroadCastJson("create", msg)

	if err != nil {

		return
	}

	broadcastMessageToAllClients(json)

}

func BroadcastDeleteMessageToAllClients(msgId string) {

	delResponse := new(models.DeleteMsgResPayload)
	delResponse.MessageId = msgId

	json, err := createBroadCastJson("delete", delResponse)

	if err != nil {

		return
	}

	broadcastMessageToAllClients(json)

}

func BroadcastEditMessageToAllClients(msgId string, content string) {

	editResponse := new(models.EditMsgReqPayload)
	editResponse.MessageId = msgId
	editResponse.Content = content

	json, err := createBroadCastJson("edit", editResponse)

	if err != nil {

		return
	}

	broadcastMessageToAllClients(json)

}

func broadcastMessageToAllClients(jsonToSend string) {

	mutexLock.Lock()

	defer mutexLock.Unlock()

	for key := range activeSocketConnections {

		err := key.WriteJSON(jsonToSend)

		if err != nil {
			fmt.Printf("Error sending message to a client %v\n", err)
			key.Close()
			delete(activeSocketConnections, key)
		}

	}

}

func createBroadCastJson(msgType string, payload any) (string, error) {

	responseMsg := ResponseMessage{MsgType: msgType, Payload: payload}

	jsonBytes, err := json.Marshal(responseMsg)

	if err != nil {

		return "", err

	}

	json := string(jsonBytes)

	return json, nil

}
