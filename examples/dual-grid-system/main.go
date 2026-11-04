package main

import (
	"embed"

	fl "github.com/bernhardfritz/flatland"
)

type TileType int

const (
	None TileType = iota
	Some
)

type TerrainType int

const (
	Dirt TerrainType = iota
	Grass
)

type Vec2i [2]int

var neighborsToAtlasCoord = [16]Vec2i{
	{0, 3}, // 0x0000
	{1, 3}, // 0x0001
	{0, 0}, // 0x0010
	{3, 0}, // 0x0011
	{0, 2}, // 0x0100
	{1, 0}, // 0x0101
	{2, 3}, // 0x0110
	{1, 1}, // 0x0111
	{3, 3}, // 0x1000
	{0, 1}, // 0x1001
	{3, 2}, // 0x1010
	{2, 0}, // 0x1011
	{1, 2}, // 0x1100
	{2, 2}, // 0x1101
	{3, 1}, // 0x1110
	{2, 1}, // 0x1111
}

const rows = 20
const cols = 36

//go:embed resources/*
var ASSETS embed.FS

func init() {
	fl.AddFileSystem(ASSETS)
}

func main() {
	var textures [2]fl.Texture
	textures[Dirt] = fl.LoadTexture("resources/DemoDirtTiles.png")
	textures[Grass] = fl.LoadTexture("resources/DemoGrassTiles.png")
	selectionIndicator := fl.LoadTexture("resources/SelectionIndicator.png")

	var displayMapLayers [2][rows][cols]TileType
	for row := 0; row < rows; row++ {
		for col := 0; col < cols; col++ {
			displayMapLayers[Grass][row][col] = Some
		}
	}

	var time float64
	animate := func() {
		fl.ClearBackground(162, 166, 94, 255)
		tileSize := fl.Width / (cols - 2)
		fl.SetTransform(1, 0, 0, 1, -tileSize/2, -tileSize/2)
		for i, displayMapLayer := range displayMapLayers {
			texture := textures[i]
			for row := 0; row < rows-1; row++ {
				for col := 0; col < cols-1; col++ {
					neighbors := displayMapLayer[row][col]<<3 | displayMapLayer[row][col+1]<<2 | displayMapLayer[row+1][col]<<1 | displayMapLayer[row+1][col+1]
					atlasCoord := neighborsToAtlasCoord[neighbors]
					dx := float64(col) * tileSize
					dy := float64(row) * tileSize
					dWidth := tileSize
					dHeight := tileSize
					sx := float64(atlasCoord[0]) * (texture.Width / 4)
					sy := float64(atlasCoord[1]) * (texture.Height / 4)
					sWidth := texture.Width / 4
					sHeight := texture.Height / 4
					fl.DrawTexture8f(texture, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight)
				}
			}
		}
		fl.SetTransform(1, 0, 0, 1, 0, 0)
		for row := 0; row < rows; row++ {
			fl.DrawRectangle(0, float64(row)*tileSize, fl.Width, 1)
		}
		for col := 0; col < cols; col++ {
			fl.DrawRectangle(float64(col)*tileSize, 0, 1, fl.Height)
		}
		mouseCol := int(fl.MouseX / tileSize)
		mouseRow := int(fl.MouseY / tileSize)
		if mouseCol < cols-1 && mouseRow < rows-1 {
			if fl.IsMouseButtonPressed(fl.MouseButtonLeft) {
				displayMapLayers[Dirt][mouseRow+1][mouseCol+1] = Some
				displayMapLayers[Grass][mouseRow+1][mouseCol+1] = None
			} else if fl.IsMouseButtonPressed(fl.MouseButtonRight) {
				displayMapLayers[Dirt][mouseRow+1][mouseCol+1] = None
				displayMapLayers[Grass][mouseRow+1][mouseCol+1] = Some
			}
		}
		fl.DrawTexture8f(selectionIndicator, float64(mouseCol)*tileSize, float64(mouseRow)*tileSize, tileSize, tileSize, float64(int(time/500)%2)*17, 0, 17, 17)
		time += fl.DeltaTime
	}
	fl.SetAnimationLoop(animate)
}
