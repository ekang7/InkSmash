import React from "react";
import {
  P5CanvasInstance,
  ReactP5Wrapper,
} from "@p5-wrapper/react";
import p5Types from "p5";

// Define the interface for the sketch props
interface SketchProps {
  width: number;
  height: number;
  x: number;
  y: number;
}

function sketch(p5: P5CanvasInstance<SketchProps>) {
  // Destructure the props
  const { width, height, x, y } = p5.props;

  // Variables
  const squareSize = 4;
  const numSquaresX = Math.floor(width / squareSize);
  const numSquaresY = Math.floor(height / squareSize);
  let appearance: p5Types.Color[][] = [];
  let backgroundColor: p5Types.Color;
  let eraseMode = false;

  let colorPicker: p5Types.Element;
  let eraseButton: p5Types.Element;
  let clearButton: p5Types.Element;
  let saveButton: p5Types.Element;
  let downloadButton: p5Types.Element;

  let canvas: p5Types.Graphics;

  p5.setup = () => {
    let cnv = p5.createCanvas(width, height);
    cnv.position(x, y);
    canvas = p5.createGraphics(width, height);
    backgroundColor = p5.color(255);
    canvas.background(backgroundColor);
    createGrid();

    // Color Picker
    colorPicker = p5.createColorPicker("#49DFFD");
    colorPicker.position(x, y + height + 20);
    colorPicker.size(50, 28);

    // Erase Button
    eraseButton = p5.createButton("ERASE MODE");
    eraseButton.size(100, 32);
    eraseButton.position(x + 60, y + height + 20);
    eraseButton.mousePressed(switchDrawMode);

    // Save Button
    saveButton = p5.createButton("SAVE");
    saveButton.size(80, 32);
    saveButton.position(x + 170, y + height + 20);
    saveButton.mousePressed(closeCanvas);

    // Download Button
    downloadButton = p5.createButton("DOWNLOAD PNG");
    downloadButton.size(150, 32);
    downloadButton.position(x + width - 150, y + height + 20);
    downloadButton.mousePressed(download);

    // Clear Button
    clearButton = p5.createButton("CLEAR");
    clearButton.size(80, 32);
    clearButton.position(x + width - 240, y + height + 20);
    clearButton.mousePressed(clean);

    // Initialize Appearance Array
    let transparentColor = p5.color(255, 255, 255, 0);
    for (let j = 0; j < numSquaresY; j++) {
      appearance[j] = [];
      for (let i = 0; i < numSquaresX; i++) {
        appearance[j][i] = transparentColor;
      }
    }
  };

  // Helper Functions
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
    for (let j = 0; j < numSquaresY; j++) {
      for (let i = 0; i < numSquaresX; i++) {
        appearance[j][i] = transparentColor;
      }
    }
  }

  function download(filename = "myCharacter") {
    canvas.save(filename);
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
    if (x >= 0 && x < numSquaresX && y >= 0 && y < numSquaresY) {
      if (eraseMode) {
        canvas.fill(backgroundColor);
        appearance[y][x] = p5.color(255, 255, 255, 0);
      } else {
        canvas.fill(colorPicker.color());
        appearance[y][x] = colorPicker.color();
      }
      canvas.noStroke();
      canvas.square(x * squareSize, y * squareSize, squareSize);
    }
  }

  let prevX: number | null = null;
  let prevY: number | null = null;

  p5.mousePressed = () => {
    prevX = snap(p5.mouseX);
    prevY = snap(p5.mouseY);
    fillSquare(prevX, prevY);
  };

  p5.mouseDragged = () => {
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

  p5.draw = () => {
    p5.image(canvas, 0, 0);
  };
}

export default function App(props: SketchProps) {
  // Default values if props are not provided
  const width = props.width || 640;
  const height = props.height || 640;
  const x = props.x || 0;
  const y = props.y || 0;

  return (
    <ReactP5Wrapper
      sketch={sketch}
      width={width}
      height={height}
      x={x}
      y={y}
    />
  );
}
