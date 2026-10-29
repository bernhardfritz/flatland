const fillColor = { r: 255, g: 255, b: 255, a: 255 };
const backgroundColor = { r: 0, g: 0, b: 0, a: 0 };
const padding = 1;

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

function colorToCSS(color: Color) {
  return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a / 255 + ')';
}

function codePointToString(codePoint: number) {
  return codePoint <= 0xFFFF
    ? String.fromCharCode(codePoint)
    : String.fromCharCode((codePoint - 0x10000 >> 10) + 0xD800, (codePoint - 0x10000 & 0x3FF) + 0xDC00);
}

interface Image {
  width: number,
  height: number,
  data: Uint8Array<ArrayBuffer>,
  originX: number,
  originY: number,
  advance: number,
}

function renderCodePoint(canvas: HTMLCanvasElement | OffscreenCanvas, context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, font: string, fontSize: number, codePoint: number, multiplier: number): Image {
  const size = fontSize;
  let originX = Math.round(fontSize * (multiplier - 1) / 2);
  let originY = Math.round(fontSize * (multiplier + 1) / 2);
  const character = codePointToString(codePoint);
  const width = canvas.width = size * multiplier;
  const height = canvas.height = size * multiplier;
  const bg = backgroundColor;

  context.font = font;
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
  context.lineWidth = 0;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.miterLimit = 4;

  context.fillStyle = colorToCSS(bg);
  context.fillRect(0, 0, width, height);

  // Fill
  context.fillStyle = colorToCSS(fillColor);
  context.fillText(character, originX, originY);

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  let xmin = 0;
  let ymin = 0;
  let xmax = width;
  let ymax = height;

  outer: while (xmin + 1 < xmax) {
    for (let y = 0; y < height; y++) {
      if (!isSameColor(bg, xmin, y, width, data)) {
        break outer;
      }
    }
    xmin++;
  }

  outer: while (ymin + 1 < ymax) {
    for (let x = 0; x < width; x++) {
      if (!isSameColor(bg, x, ymin, width, data)) {
        break outer;
      }
    }
    ymin++;
  }

  outer: while (xmax - 1 > xmin) {
    for (let y = 0; y < height; y++) {
      if (!isSameColor(bg, xmax - 1, y, width, data)) {
        break outer;
      }
    }
    xmax--;
  }

  outer: while (ymax - 1 > ymin) {
    for (let x = 0; x < width; x++) {
      if (!isSameColor(bg, x, ymax - 1, width, data)) {
        break outer;
      }
    }
    ymax--;
  }

  // Attempt to handle fonts with unusually large glyphs (Zapfino for example)
  if ((xmin === 0 || ymin === 0 || xmax === width || ymax === height) && multiplier < 5) {
    return renderCodePoint(canvas, context, font, fontSize, codePoint, multiplier + 1);
  }

  const trimmedWidth = xmax - xmin;
  const trimmedHeight = ymax - ymin;
  const trimmedData = new Uint8Array(trimmedWidth * trimmedHeight << 2);

  for (let y = 0; y < trimmedHeight; y++) {
    const start = xmin + (y + ymin) * width << 2;
    trimmedData.set(data.subarray(start, start + (trimmedWidth << 2)), y * trimmedWidth << 2);
  }

  // Empty glyphs shouldn't have offsets
  if (trimmedWidth === 1 && trimmedHeight === 1 && isSameColor(bg, xmin, ymin, width, data)) {
    originX = xmin;
    originY = ymin;
  }

  const image: Image = {
    width: trimmedWidth,
    height: trimmedHeight,
    data: trimmedData,
    originX: originX - xmin,
    originY: originY - ymin,
    advance: Math.round(context.measureText(character).width),
  };

  return image;
}

function isSameColor(color: Color, x: number, y: number, width: number, data: ImageData['data']): boolean {
  const i = x + y * width << 2;
  return (
    Math.abs(data[i] - color.r) < 2 &&
    Math.abs(data[i + 1] - color.g) < 2 &&
    Math.abs(data[i + 2] - color.b) < 2 &&
    Math.abs(data[i + 3] - color.a) < 2);
}

function generateCodePointsASCII(): number[] {
  const codePoints: number[] = [];

  for (let i = 0x20; i < 0x7F; i++) {
    codePoints.push(i);
  }

  return codePoints;
}

interface Coordinates {
  x: number;
  y: number;
}

function pack(images: Image[]) {
  let maxWidth = 0;
  let totalArea = 0;
  const coordinates = new Array<Coordinates>(images.length);

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    maxWidth = Math.max(maxWidth, image.width);
    totalArea += image.width * image.height;
  }

  const sorted = images.map(function(image, i) {
    return {
      index: i,
      width: image.width + 2 * padding,
      height: image.height + 2 * padding,
    };
  }).sort(function(a, b) {
    return b.height - a.height || b.width - a.width;
  });

  let width = Math.max(maxWidth, Math.ceil(Math.sqrt(totalArea) * 2));

  if (width > 4096) {
    width = Math.max(maxWidth, Math.ceil(Math.sqrt(totalArea) * 1.25));
  }

  let currentX = 0;
  let currentY = 0;
  let rowWidth = 0;
  let rowHeight = 0;

  for (let i = 0; i < sorted.length; i++) {
    const image = sorted[i];
    if (currentX + image.width > width) {
      currentX = 0;
      currentY += rowHeight;
      rowHeight = 0;
    }
    coordinates[image.index] = {
      x: currentX + padding,
      y: currentY + padding,
    };
    currentX += image.width;
    rowWidth = Math.max(rowWidth, currentX);
    rowHeight = Math.max(rowHeight, image.height);
  }

  const height = currentY + rowHeight;

  return {
    width: rowWidth,
    height: height,
    coordinates: coordinates.slice(),
  };
}

interface Character {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originX: number;
  originY: number;
  advance: number;
}

export function generate(canvas: HTMLCanvasElement | OffscreenCanvas, context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, font: string, fontSize: number): Character[] {
  const codePoints = generateCodePointsASCII();
  const images: Image[] = [];

  for (let i = 0; i < codePoints.length; i++) {
    images.push(renderCodePoint(canvas, context, font, fontSize, codePoints[i], 2));
  }

  const packed = pack(images);
  const imageData = context.createImageData(packed.width, packed.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = backgroundColor.r;
    data[i + 1] = backgroundColor.g;
    data[i + 2] = backgroundColor.b;
    data[i + 3] = backgroundColor.a;
  }

  for (let i = 0; i < codePoints.length; i++) {
    const image = images[i];
    const coordinates = packed.coordinates[i];

    for (let y = 0; y < image.height; y++) {
      const start = y * image.width << 2;
      data.set(image.data.subarray(start, start + (image.width << 2)), coordinates.x + (coordinates.y + y) * packed.width << 2);
    }
  }

  canvas.width = packed.width;
  canvas.height = packed.height;
  context.putImageData(imageData, 0, 0);

  const characters: Character[] = codePoints.map(function(codePoint, i) {
    const image = images[i];
    return {
      text: codePointToString(codePoint),
      x: packed.coordinates[i].x - padding,
      y: packed.coordinates[i].y - padding,
      width: image.width + 2 * padding,
      height: image.height + 2 * padding,
      originX: image.originX + padding,
      originY: image.originY + padding,
      advance: image.advance,
    };
  });
  
  return characters;
}