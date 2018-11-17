package main

import "gopkg.in/go-playground/validator.v9"

type UpdateRequest struct {
	Caption string  `json:"caption" form:"caption" query:"caption" validate:"required"`
	Title   *string `json:"title" form:"title" query:"title"`
	Footer  *string `json:"footer" form:"footer" query:"footer"`
}

type Metadata struct {
	Title  string  `json:"title"`
	Images []Image `json:"images"`
	Footer string  `json:"footer"`
	BG     string  `json:"bg"`
}

type Image struct {
	Id      string `json:"id"`
	Caption string `json:"caption"`
	Size    int    `json:"size"`
	Thumb   string `json:"thumb"`
	Big     string `json:"big"`
	Index   int    `json:"index"`
}

type CustomValidator struct {
	validator *validator.Validate
}
