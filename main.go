package main

import (
	"html/template"
	"net/http"

	"github.com/labstack/echo"
	"gopkg.in/go-playground/validator.v9"
	"io/ioutil"
	"encoding/json"
)


var data = Metadata{Title: "Tôi có một nỗi buồn thật đẹp.", Images: []Image{}, Footer: "Tôi là An, đây là những kỷ niệm đẹp của tôi. Tôi sẽ không bao giờ quên.", BG: "images/bg.jpg"}


func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

func main() {
	loadData()
	defer func() {
		js, _ := json.Marshal(data)
		ioutil.WriteFile("data/data.json", js, 0644)
	}()
	e := echo.New()
	e.Validator = &CustomValidator{validator: validator.New()}

	e.Static("/", "views")
	renderer := &TemplateRenderer{
		templates: template.Must(template.ParseGlob("views/*.html")),
	}
	e.Renderer = renderer

	e.GET("/", func(c echo.Context) error {
		return c.Render(http.StatusOK, "index.html", loadData())
	})
	e.GET("/api/images", GetImages)
	e.POST("/api/images", InsertImage)
	e.DELETE("/api/images/:image_id", DeleteImage)

	e.Logger.Fatal(e.Start(":80"))
}
