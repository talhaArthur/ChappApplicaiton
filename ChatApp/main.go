package main

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"

	"chatapp/routes"
	"chatapp/storage"
)

func main() {

	app := fiber.New()

	// defer func() {

	// 	app.Shutdown()
	// 	storage.CloseRedisClient()
	// 	fmt.Println("Server shutdown gracefully")
	// }()

	storage.InitializeRedisClient()

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	routes.RegisterMessageRoutes(app)

	app.Listen(":8080")

}
