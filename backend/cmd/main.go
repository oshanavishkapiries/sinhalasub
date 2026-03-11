// @title Sinhala Subtitle API
// @version 1.0.0
// @description This is the API for Sinhala Subtitle Backend service
// @termsOfService http://swagger.io/terms/
// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io
// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html
// @host localhost:3000
// @BasePath /
// @schemes http https
package main

import (
	"context"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/app"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
)

func main() {

	utils.LoadEnv()
	port := utils.GetEnv("PORT", "3000")

	application := app.New()

	err := application.Start(context.TODO(), port)
	if err != nil {
		utils.ErrorLog("starting application : %s", err)
		return
	}

}
