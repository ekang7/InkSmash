import React from "react";
import {
  P5CanvasInstance,
  ReactP5Wrapper,
  SketchProps,
} from "@p5-wrapper/react";
import p5Types from "p5";

function sketch(p5: P5CanvasInstance<SketchProps>) {
  // Variables
  let squareSize: number;
  const numSquares = 80;
  let canvasWidth: number;
  let canvasHeight: number;
  let appearance: p5Types.Color[][] = [];
  let backgroundColor: p5Types.Color;
  let eraseMode = false;

  let colorPicker: p5Types.Element;
  let eraseButton: p5Types.Element;
  let clearButton: p5Types.Element;
  let saveButton: p5Types.Element;
  let downloadButton: p5Types.Element;

  let canvas: p5Types.Graphics;

  let isSetupComplete = false;

  p5.setup = () => {
    updateCanvasSize();

    let cnv = p5.createCanvas(canvasWidth, canvasHeight);
    cnv.parent("canvas-container");

    canvas = p5.createGraphics(canvasWidth, canvasHeight);
    backgroundColor = p5.color(255);
    canvas.background(backgroundColor);
    createGrid();

    // Color Picker
    colorPicker = p5.createColorPicker("#49DFFD");
    colorPicker.parent("controls");
    colorPicker.size(50, 28);

    // Erase Button
    eraseButton = p5.createButton("ERASE MODE");
    eraseButton.size(100, 32);
    eraseButton.parent("controls");
    eraseButton.mousePressed(switchDrawMode);

    // Save Button
    saveButton = p5.createButton("SAVE");
    saveButton.size(80, 32);
    saveButton.parent("controls");
    saveButton.mousePressed(closeCanvas);

    // Download Button
    downloadButton = p5.createButton("DOWNLOAD PNG");
    downloadButton.size(150, 32);
    downloadButton.parent("controls");
    downloadButton.mousePressed(download);

    // Clear Button
    clearButton = p5.createButton("CLEAR");
    clearButton.size(80, 32);
    clearButton.parent("controls");
    clearButton.mousePressed(clean);

    // Initialize Appearance Array
    let transparentColor = p5.color(255, 255, 255, 0);
    for (let j = 0; j < numSquares; j++) {
      appearance[j] = [];
      for (let i = 0; i < numSquares; i++) {
        appearance[j][i] = transparentColor;
      }
    }

    isSetupComplete = true;
  };

  function updateCanvasSize() {
    // Adjust canvas size based on window size
    canvasWidth = p5.min(p5.windowWidth, p5.windowHeight) * 0.9;
    canvasHeight = canvasWidth; // Keep it square

    squareSize = canvasWidth / numSquares;
  }

  // Handle window resizing
  p5.windowResized = () => {
    updateCanvasSize();
    p5.resizeCanvas(canvasWidth, canvasHeight);
    canvas.resizeCanvas(canvasWidth, canvasHeight);
    createGrid();
    redrawCanvas();
  };

  function createGrid() {
    canvas.background(backgroundColor);
    canvas.strokeWeight(1);
    canvas.stroke(150);
  }

  function switchDrawMode() {
    eraseMode = !eraseMode;
    let text = eraseMode ? "DRAW MODE" : "ERASE MODE";
    eraseButton.html(text);
  }

  function clean() {
    createGrid();
    let transparentColor = p5.color(255, 255, 255, 0);
    for (let j = 0; j < numSquares; j++) {
      for (let i = 0; i < numSquares; i++) {
        appearance[j][i] = transparentColor;
      }
    }
  }

  function download(filename = "myCharacter") {
    if (!isSetupComplete || !canvas) {
      console.error("Download attempted before initialization");
      return;
    } else {
      p5.saveCanvas(filename + ".png");
    }
  }

  function closeCanvas() {
    [colorPicker, eraseButton, clearButton, saveButton, downloadButton].forEach(
      (button) => {
        button.hide();
      }
    );
    canvas.remove();
  }

  function snap(p: number) {
    return Math.floor(p / squareSize);
  }

  // Function to draw a line between two points and fill squares along the line
  function drawLine(x0: number, y0: number, x1: number, y1: number) {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let e2: number;

    while (true) {
      fillSquare(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  function fillSquare(x: number, y: number) {
    if (
      !isSetupComplete ||
      !canvas ||
      !colorPicker ||
      x < 0 ||
      x >= numSquares ||
      y < 0 ||
      y >= numSquares
    ) {
      return;
    }

    try {
      if (eraseMode) {
        canvas.fill(backgroundColor);
        appearance[y][x] = p5.color(255, 255, 255, 0);
      } else {
        canvas.fill(colorPicker.color());
        appearance[y][x] = colorPicker.color();
      }
      canvas.noStroke();
      canvas.square(x * squareSize, y * squareSize, squareSize);
    } catch (error) {
      console.error("Error in fillSquare:", error);
    }
  }

  let prevX: number | null = null;
  let prevY: number | null = null;

  p5.mousePressed = () => {
    if (!isSetupComplete) return;
    prevX = snap(p5.mouseX);
    prevY = snap(p5.mouseY);
    fillSquare(prevX, prevY);
  };

  p5.mouseDragged = () => {
    if (!isSetupComplete) return;
    const x = snap(p5.mouseX);
    const y = snap(p5.mouseY);
    if (prevX !== null && prevY !== null) {
      drawLine(prevX, prevY, x, y);
    }
    prevX = x;
    prevY = y;
  };

  p5.mouseReleased = () => {
    prevX = null;
    prevY = null;
  };

  // Handle touch events
  p5.touchStarted = () => {
    p5.mousePressed();
  };

  p5.touchMoved = () => {
    p5.mouseDragged();
    // Prevent default behavior to avoid scrolling
    return false;
  };

  p5.touchEnded = () => {
    p5.mouseReleased();
  };

  function redrawCanvas() {
    // Redraw existing squares when canvas is resized
    for (let y = 0; y < numSquares; y++) {
      for (let x = 0; x < numSquares; x++) {
        if (appearance[y][x].levels[3] !== 0) {
          canvas.fill(appearance[y][x]);
          canvas.noStroke();
          canvas.square(x * squareSize, y * squareSize, squareSize);
        }
      }
    }
  }

  p5.draw = () => {
    p5.image(canvas, 0, 0);
  };
}

export default function App() {
  return (
    <div>
      <div id="canvas-container" style={{ position: "relative" }}></div>
      <div
        id="controls"
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: "10px",
          justifyContent: "center",
        }}
      ></div>
      <ReactP5Wrapper sketch={sketch} />
    </div>
  );
}
