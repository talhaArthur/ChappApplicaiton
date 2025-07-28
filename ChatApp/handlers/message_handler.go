package handlers

import (
	"github.com/gofiber/fiber/v2"

	"fmt"

	"chatapp/models"
	"chatapp/storage"
)

func HandleNewMessage(ctx *fiber.Ctx) error {

	msg := &models.Message{}
	err := ctx.BodyParser(msg)

	if err != nil {

		fmt.Printf("Failed to parse new message body. Error: %v\n", err)
		return err
	}

	// TODO: Add message validation to check for invalid or missing properties

	err = storage.AddMessageToRedis(msg)

	if err != nil {
		fmt.Printf("Failed to add new user message %v\n", err)
	}

	return err
}

func DeleteExistingUserMessage(ctx *fiber.Ctx) error {
	delReq := new(models.DeleteMsgReqPayload)
	err := ctx.BodyParser(delReq)

	if err != nil {

		fmt.Printf("Failed to parse delete user message request: %v\n", err)
		return err
	}

	err = storage.DeleteExistingMessage(delReq.MessageId, delReq.Author)

	if err != nil {

		fmt.Printf("Faied to delete existing user message id:%s, author %s. Error%v\n", delReq.MessageId, delReq.Author, err)
		return err
	}

	BroadcastDeleteMessageToAllClients(delReq.MessageId)

	return err

}

func UpdateExistingUserMessage(ctx *fiber.Ctx) error {

	updateReq := new(models.EditMsgReqPayload)
	err := ctx.BodyParser(updateReq)

	if err != nil {

		fmt.Printf("Failed to parse edit user message request: %v\n", err)
		return err
	}

	err = storage.EditExistingMessage(updateReq.MessageId, updateReq.Author, updateReq.Content)

	if err != nil {

		fmt.Printf("Faied to edit existing user message id:%s, author %s. Error:%v\n", updateReq.MessageId, updateReq.Author, err)
		return err
	}

	BroadcastEditMessageToAllClients(updateReq.MessageId, updateReq.Content)

	return err
}

func RetrieveAllMessages(ctx *fiber.Ctx) error {

	msgsJson, err := storage.GetStoredMessages()

	if err != nil {

		fmt.Printf("Failed to retrieve stored user messages :%v\n", err)
		return err
	}

	return ctx.SendString(msgsJson)

}
