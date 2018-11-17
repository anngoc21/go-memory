package main

import (
	"github.com/labstack/echo"
	"os"
	"io"
	"net/http"
	"html/template"
	"image/jpeg"
	"github.com/nfnt/resize"
	"fmt"
	"time"
	"image"
	"math/rand"
	"io/ioutil"
	"encoding/json"
)

func init() {
	rand.Seed(time.Now().UnixNano())

}

type UpdateRequest struct {
	Caption string  `json:"caption" form:"caption" query:"caption" validate:"required"`
	Title   *string `json:"title" form:"title" query:"title"`
	Footer  *string `json:"footer" form:"footer" query:"footer"`
}

func DeleteImage(c echo.Context) error {
	imageID := c.Param("image_id")
	for key, image := range data.Images {
		if image.Id == imageID {
			data.Images[key] = data.Images [len(data.Images)-1] // Copy last element to index i
			data.Images = data.Images [:len(data.Images)-1]     // Truncate slice
		}
	}
	go func() {
		js, _ := json.Marshal(data)
		ioutil.WriteFile("data/data.json", js, 0644)
	}()
	return c.JSON(http.StatusOK, data)

}
func GetImages(c echo.Context) error {
	return c.JSON(http.StatusOK, data)
}
func InsertImage(c echo.Context) error {
	var image Image
	request := new(UpdateRequest)
	if err := c.Bind(request); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	if err := c.Validate(request); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	updateBackground(c)
	// Source
	file, err := c.FormFile("image")
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	src, err := file.Open()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	// decode jpeg into image.Image
	img, err := jpeg.Decode(src)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	defer src.Close()
	id := time.Now().UnixNano()
	fileName := fmt.Sprintf("%d.jpg", id)

	err = resizeImage(fileName, img, false, false)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	err = resizeImage(fileName, img, true, false)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	image = Image{
		Thumb:   fmt.Sprintf("images/thumbs/%s", fileName),
		Size:    rand.Int()%3 + 1,
		Index:   rand.Int()%2 + 1,
		Caption: request.Caption,
		Big:     fmt.Sprintf("images/fulls/%s", fileName),
		Id:      fmt.Sprintf("%d", id),
	}
	data.Images = append(data.Images, image)
	if request.Title != nil {
		data.Title = *request.Title
	}
	if request.Footer != nil {
		data.Footer = *request.Footer
	}
	go func() {
		js, _ := json.Marshal(data)
		ioutil.WriteFile("data/data.json", js, 0644)
	}()
	return c.JSON(http.StatusOK, data)
}

func updateBackground(c echo.Context) {
	file, err := c.FormFile("bg")
	if err != nil {
		return
	}
	src, err := file.Open()
	if err != nil {
		return
	}
	// decode jpeg into image.Image
	img, err := jpeg.Decode(src)
	if err != nil {
		return
	}
	defer src.Close()
	fileName := fmt.Sprintf("bg.jpg")
	err = resizeImage(fileName, img, false, true)
	if err != nil {
		return
	}
	data.BG = fmt.Sprintf("images/bg.jpg")
}

func resizeImage(fileName string, img image.Image, thumb bool, bg bool) error {

	if bg {
		m := resize.Resize(1024, 0, img, resize.Lanczos3)
		out, err := os.Create(fmt.Sprintf("views/images/%s", fileName))
		if err != nil {
			return err
		}
		defer out.Close()
		jpeg.Encode(out, m, nil)
		return nil
	}
	switch thumb {
	case false:
		m := resize.Resize(2000, 0, img, resize.Lanczos3)
		out, err := os.Create(fmt.Sprintf("views/images/fulls/%s", fileName))
		if err != nil {
			return err
		}
		defer out.Close()
		jpeg.Encode(out, m, nil)
		return nil
	case true:
		m := resize.Resize(640, 0, img, resize.Lanczos3)
		out, err := os.Create(fmt.Sprintf("views/images/thumbs/%s", fileName))
		if err != nil {
			return err
		}
		defer out.Close()
		jpeg.Encode(out, m, nil)
		return nil
	}
	return nil
}

type TemplateRenderer struct {
	templates *template.Template
}

func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {

	// Add global methods if data is a map
	if viewContext, isMap := data.(map[string]interface{}); isMap {
		viewContext["reverse"] = c.Echo().Reverse
	}

	return t.templates.ExecuteTemplate(w, name, data)
}

func loadData() Metadata {
	jsonFile, err := os.Open("data/data.json")
	if err != nil {
		fmt.Println(err)
	}
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	var result Metadata
	json.Unmarshal([]byte(byteValue), &result)
	data = result
	return result
}
