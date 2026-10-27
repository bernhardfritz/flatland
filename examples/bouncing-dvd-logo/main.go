// This example renders a bouncing DVD logo. It loads an embedded image,
// updates its position every frame and changes its color whenever it
// hits the edge of the screen.
package main

import (
	"embed"
	"image/color"
	"math/rand/v2"

	fl "github.com/bernhardfritz/flatland"
)

type Vec2 struct {
	X float64
	Y float64
}

//go:embed resources/*
var ASSETS embed.FS

func init() {
	fl.AddFileSystem(ASSETS)
}

func main() {
	dvdLogo := fl.LoadTexture("resources/DVD_video_logo.png")
	position := Vec2{0, 0}
	velocity := Vec2{0.2, 0.2}
	color := randomColor()

	animate := func() {
		fl.ClearBackground(0, 0, 0, 255)
		fl.SetTintColor(color.R, color.G, color.B, color.A)
		fl.DrawTexture2f(dvdLogo, position.X, position.Y)

		position.X += velocity.X * fl.DeltaTime
		position.Y += velocity.Y * fl.DeltaTime

		if position.X+dvdLogo.Width >= fl.Width {
			velocity.X = -velocity.X
			position.X = fl.Width - dvdLogo.Width
			color = randomColor()
		} else if position.X <= 0 {
			velocity.X = -velocity.X
			position.X = 0
			color = randomColor()
		}

		if position.Y+dvdLogo.Height >= fl.Height {
			velocity.Y = -velocity.Y
			position.Y = fl.Height - dvdLogo.Height
			color = randomColor()
		} else if position.Y <= 0 {
			velocity.Y = -velocity.Y
			position.Y = 0
			color = randomColor()
		}
	}

	fl.SetAnimationLoop(animate)
}

func randUint8() uint8 {
	return uint8(rand.Uint32())
}

func randomColor() color.RGBA {
	return color.RGBA{randUint8(), randUint8(), randUint8(), 255}
}
