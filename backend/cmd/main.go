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

	err := application.Start(context.TODO() , port)
	if err != nil {
		utils.ErrorLog("starting application : %s", err)
		return
	}

}


