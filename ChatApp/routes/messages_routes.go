package routes

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"

	"chatapp/handlers"
)

func RegisterMessageRoutes(app *fiber.App) {

	app.Post("/msg", handlers.HandleNewMessage)
	app.Get("/msg", handlers.RetrieveAllMessages)
	app.Delete("/msg", handlers.DeleteExistingUserMessage)
	app.Put("/msg", handlers.UpdateExistingUserMessage)

	app.Get("/ws/chat", websocket.New(handlers.SocketMessageHandler))

}
