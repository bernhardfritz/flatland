# flatland

[![Go Reference](https://pkg.go.dev/badge/github.com/bernhardfritz/flatland.svg)](https://pkg.go.dev/github.com/bernhardfritz/flatland)
[![NPM Version](https://img.shields.io/npm/v/%40bernhardfritz%2Fflatland)](https://www.npmjs.com/package/@bernhardfritz/flatland)

<a href="https://pkg.go.dev/github.com/bernhardfritz/flatland"><img src="./gamer.svg" alt="Gopher holding a gamepad" width="128" align="right"></a>

**A minimal 2D graphics library for Go that runs in the browser using WebAssembly and WebGL.**

Flatland is designed to make browser-based 2D graphics feel familiar to Go developers. Its API is intentionally small and you don't need to know JavaScript, WebGL or other web technologies to get started.

[Examples](https://pkg.go.dev/github.com/bernhardfritz/flatland/examples) &middot;
[API documentation](https://pkg.go.dev/github.com/bernhardfritz/flatland) &middot;
[Start from template](https://github.com/bernhardfritz/flatland-template/generate)

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install)
- VS Code with [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension installed

## Quick start

The easiest way to get started is with the [flatland template](https://github.com/bernhardfritz/flatland-template/generate) which provides the setup needed to build and run a Go/WebAssembly application.

You can also try it immediately in GitHub Codespaces:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/bernhardfritz/flatland-template?quickstart=1)

## Example

<p align="center">
	<img src="./bouncing-dvd-logo.gif" alt="Bouncing DVD logo">
</p>

```go
// This example renders a bouncing DVD logo. It loads an embedded image,
// updates its position every frame and changes its color whenever it hits the
// edge of the screen.
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
```

## Features

- 2D rendering with WebGL
- Go → WebAssembly
- Textures and texture regions
- Filled rectangles
- Monospaced text rendering
- 2D transformations
- Keyboard and mouse input
- Frame-based animation with delta time
- Embedded asset support
- Minimal API designed for Go developers

## API overview

| Category  | Functions                                                                                                                                                                                                                                                                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendering | [DrawRectangle](https://pkg.go.dev/github.com/bernhardfritz/flatland#DrawRectangle), [DrawTexture2f](https://pkg.go.dev/github.com/bernhardfritz/flatland#DrawTexture2f), [DrawTexture4f](https://pkg.go.dev/github.com/bernhardfritz/flatland#DrawTexture4f), [DrawTexture8f](https://pkg.go.dev/github.com/bernhardfritz/flatland#DrawTexture8f), [DrawText](https://pkg.go.dev/github.com/bernhardfritz/flatland#DrawText) |
| Animation | [SetAnimationLoop](https://pkg.go.dev/github.com/bernhardfritz/flatland#SetAnimationLoop), `DeltaTime`                                                                                                                                                                                                                                                           |
| Input     | [IsKeyPressed](https://pkg.go.dev/github.com/bernhardfritz/flatland#IsKeyPressed), [IsMouseButtonPressed](https://pkg.go.dev/github.com/bernhardfritz/flatland#IsMouseButtonPressed), `MouseX`, `MouseY`                                                                                                                                                         |
| Graphics  | [ClearBackground](https://pkg.go.dev/github.com/bernhardfritz/flatland#ClearBackground), [SetTintColor](https://pkg.go.dev/github.com/bernhardfritz/flatland#SetTintColor), [SetTransform](https://pkg.go.dev/github.com/bernhardfritz/flatland#SetTransform)                                                                                                    |
| Assets    | [LoadTexture](https://pkg.go.dev/github.com/bernhardfritz/flatland#LoadTexture), [LoadFont](https://pkg.go.dev/github.com/bernhardfritz/flatland#LoadFont), [AddFileSystem](https://pkg.go.dev/github.com/bernhardfritz/flatland#AddFileSystem)                                                                                                                                                                                    |
| Canvas    | `Width`, `Height`                                                                                                                                                                                                                                                                                                                                                |

## License

Flatland is [MIT licensed](./LICENSE).
