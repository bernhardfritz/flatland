package main

import (
	fl "github.com/bernhardfritz/flatland"
)

func main() {
	pixelSquareFont := fl.LoadFont("20px Pixel Square")

	animate := func() {
		fl.ClearBackground(0, 0, 0, 255)
		fl.SetTintColor(0, 255, 0, 255)
		fl.DrawText(pixelSquareFont, "Wake up Neo.", 15, 30)
		fl.DrawText(pixelSquareFont, "The Matrix has you.", 15, 60)
		fl.DrawText(pixelSquareFont, "Follow the White Rabbit.", 15, 90)
	}

	fl.SetAnimationLoop(animate)
}
