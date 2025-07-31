package auth

import (
	"errors"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/lestrrat-go/jwx/v3/jwk"
	"github.com/lestrrat-go/jwx/v3/jwt"
	"github.com/stormyy00/ac-shorter.git/model"
)

var (
	ErrMissingUserID = errors.New("missing user id")
)

func UserFromRequestHandler(c echo.Context) (model.User, error) {
	godotenv.Load()
	url := os.Getenv("CLIENT_URL")
	keyset, err := jwk.Fetch(c.Request().Context(), fmt.Sprintf("%s/api/auth/jwks", url))

	if err != nil {
		return model.User{}, fmt.Errorf("fetch jwks: %w", err)
	}

	token, err := jwt.ParseRequest(c.Request(), jwt.WithKeySet(keyset))
	if err != nil {
		return model.User{}, fmt.Errorf("parse request: %w", err)
	}

	userID, exists := token.Subject()
	if !exists {
		return model.User{}, ErrMissingUserID
	}

	var email string
	var name string

	token.Get("email", &email)
	token.Get("name", &name)

	return model.User{
		ID:    userID,
		Email: email,
		Name:  name,
	}, nil
}
