package utilities

import (
	"github.com/google/uuid"
)

func GenerateUniqueKey() string {

	return uuid.New().String()

}
