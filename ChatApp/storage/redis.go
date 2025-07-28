package storage

import (
	"errors"

	"github.com/redis/go-redis/v9"

	"context"
	"encoding/json"
	"fmt"
	"time"

	"chatapp/models"
	"chatapp/utilities"
)

var redisClient *redis.Client
var isInitialized bool

const messagePreFix = "message_"
const generalListName = "messagesList"

func InitializeRedisClient() {

	if isInitialized {
		fmt.Println("Redis client is already initialized. Ignoring duplicate request.")
		return
	}

	redisClient = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	isInitialized = true

	fmt.Println("Redis client initialized")

}

func CloseRedisClient() error {

	if !isInitialized {
		return errors.New("client not initialized")
	}

	if redisClient == nil {
		return errors.New("redis client is nill")
	}

	err := redisClient.Close()

	if err != nil {
		fmt.Printf("Failed to close redis client :%v\n", err)
	}

	return err
}

func AddMessageToRedis(msg *models.Message) error {

	msgBytes, err := json.Marshal(msg)

	if err != nil {
		fmt.Printf("Failed to marshal new message. :%v\n", err)
		return err
	}

	jsonMsg := string(msgBytes)

	return storeMessageInRedis(jsonMsg)
}

// TODO: Make setting key + updating list a single atomic operation
func storeMessageInRedis(msgJson string) error {

	uniqueKey := messagePreFix + utilities.GenerateUniqueKey()

	// TODO: Use a timeout context instead
	statusCmd := redisClient.Set(context.Background(), uniqueKey, msgJson, time.Minute*0)

	if statusCmd.Err() != nil {

		fmt.Printf("Error occurred while trying to store message to redis. Error %v\n", statusCmd.Err())
		return statusCmd.Err()
	}

	fmt.Println("Message successfully stored to redis db")
	return storeMessageKeyToList(uniqueKey)

}

func storeMessageKeyToList(key string) error {

	// TODO: Use a timeout context instead
	statusCmd := redisClient.LPush(context.Background(), generalListName, key)

	if statusCmd.Err() != nil {

		fmt.Printf("Error occurred while trying to store message to list. Error %v\n", statusCmd.Err())
		return statusCmd.Err()
	}

	return nil
}

func GetStoredMessages() (string, error) {

	// TODO: Increase or make range configurable
	statusCmd := redisClient.LRange(context.Background(), generalListName, 0, 49)

	if statusCmd.Err() != nil {

		fmt.Printf("Error occurred while trying to retreive messages from list. Error %v\n", statusCmd.Err())
		return "", statusCmd.Err()
	}

	msgs, err := buildJsonFromMessageKeys(statusCmd.Val())

	if err != nil {
		fmt.Printf("Error occurred while trying to retreive messages from list. Error %v\n", err)
		return "", err
	}

	return msgs, nil

}

func buildJsonFromMessageKeys(keys []string) (string, error) {

	msgMap := make(map[string]models.Message)

	for _, s := range keys {

		cmdAble := redisClient.Get(context.Background(), s)

		if cmdAble.Err() != nil {

			fmt.Printf("error reading a message with id %v from redis :%v\n", s, cmdAble.Err())
			continue
		}

		msg := cmdAble.Val()
		msgConcrete := new(models.Message)

		unmarshalError := json.Unmarshal([]byte(msg), msgConcrete)

		if unmarshalError != nil {
			fmt.Printf("error unmarshalling message with id %v that was read from redis :%v\n", s, unmarshalError)
			continue
		}

		// TODO: Add message validation

		msgMap[s] = *msgConcrete
	}

	bytesMsgs, err := json.Marshal(msgMap)

	return string(bytesMsgs), err

}

func DeleteExistingMessage(msgId string, authorId string) error {

	cmd := redisClient.Get(context.Background(), msgId)

	if cmd.Err() != nil {

		fmt.Printf("error deleting message with id %v as it was not read. :%v\n", msgId, cmd.Err())
		return cmd.Err()
	}

	msgStr := cmd.Val()
	msg := new(models.Message)
	err := json.Unmarshal([]byte(msgStr), msg)

	if err != nil {

		fmt.Printf("error deleting message with id %v as unmarshal failed. :%v\n", msgId, err)
		return err
	}

	if msg.Author != authorId {

		fmt.Printf("error deleting message with id %v as its not allowed. :%v\n", msgId, err)
		return errors.New("not allowed")
	}

	intCmd := redisClient.Del(context.Background(), msgId)

	if intCmd.Err() != nil {

		return intCmd.Err()
	}

	intCmd = redisClient.LRem(context.Background(), generalListName, 0, msgId)

	if intCmd.Err() != nil {

		return intCmd.Err()
	}

	return nil

}

func EditExistingMessage(msgId string, authorId string, newContent string) error {

	cmd := redisClient.Get(context.Background(), msgId)

	if cmd.Err() != nil {

		fmt.Printf("error modifying message with id %v as it was not read. :%v\n", msgId, cmd.Err())
		return cmd.Err()
	}

	msgStr := cmd.Val()
	msg := new(models.Message)
	err := json.Unmarshal([]byte(msgStr), msg)

	if err != nil {

		fmt.Printf("error modifying message with id %v as unmarshal failed. :%v\n", msgId, err)
		return err
	}

	if msg.Author != authorId {

		fmt.Printf("error modifying message with id %v as its not allowed. :%v\n", msgId, err)
		return errors.New("not allowed")
	}

	msg.Content = newContent
	msgBytes, err := json.Marshal(msg)

	if err != nil {
		return err
	}

	statusCmd := redisClient.Set(context.Background(), msgId, string(msgBytes), time.Minute*0)

	if statusCmd.Err() != nil {
		return statusCmd.Err()
	}

	return nil

}
