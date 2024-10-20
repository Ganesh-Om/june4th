package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.Static("static", "static")
	r.LoadHTMLGlob("template/*")
	r.GET("/", func(ctx *gin.Context) {
		ctx.String(200, "打倒中国共产党!")
	})
	r.GET("/june4th", func(ctx *gin.Context) {
		ctx.HTML(200, "june4th.html", nil)
	})
	r.Run("0.0.0.0:8000")
}
