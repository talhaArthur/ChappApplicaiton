package main

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"chatapp/routes"
	"chatapp/storage"
)

func main() {

	app := fiber.New()

	// Add CORS middleware to allow cross-origin requests
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*", // Allow all origins for development
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,ngrok-skip-browser-warning",
		AllowCredentials: false,
	}))

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
