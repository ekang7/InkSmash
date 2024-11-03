"use client";

import React, { useState, useEffect } from "react";
import { ReactP5Wrapper, SketchProps } from "@p5-wrapper/react";
import p5Types from "p5";

interface CanvasProps {
  initialTime: number;
}

const Canvas: React.FC<CanvasProps> = ({ initialTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTime);
  const [showCanvas, setShowCanvas] = useState<boolean>(true);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState<boolean>(true);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (timeRemaining > 0) {
      timerId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerId);
            setIsDrawingEnabled(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [timeRemaining]);

  const closeCanvas = () => {
    setShowCanvas(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div id="canvas-container" className="relative">
        <div style={{ width: "100%" }}>
          <div
            style={{
              position: "relative",
              height: "30px",
              backgroundColor: "#e0e0e0",
              borderRadius: "15px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(timeRemaining / initialTime) * 100}%`,
                backgroundColor: "#48bb78",
                transition: "width 1s linear",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {timeRemaining}s
            </div>
          </div>
        </div>
        {showCanvas && (
          <ReactP5Wrapper
            sketch={sketch}
            closeCanvas={closeCanvas}
            isDrawingEnabled={isDrawingEnabled}
          />
        )}
      </div>
      <div
        id="controls"
        style={{
          display: showCanvas ? "flex" : "none",
          flexWrap: "wrap",
          marginTop: "10px",
          justifyContent: "center",
        }}
      ></div>
    </div>
  );
};

export default Canvas;

const sketch = (p5: p5Types) => {
  let squareSize: number;
  const numSquaresWidth = 80;
  const numSquaresHeight = Math.floor(1.8 * numSquaresWidth);
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
  let isDrawingEnabled = true;
  let closeCanvas: () => void = () => {};

  p5.setup = () => {
    updateCanvasSize();
    let cnv = p5.createCanvas(canvasWidth, canvasHeight);
    cnv.parent("canvas-container");
    canvas = p5.createGraphics(canvasWidth, canvasHeight);
    backgroundColor = p5.color(255);
    canvas.background(backgroundColor);
    createGrid();

    colorPicker = p5.createColorPicker("#49DFFD");
    colorPicker.parent("controls");
    colorPicker.size(50, 28);

    eraseButton = p5.createButton("ERASE MODE");
    eraseButton.size(100, 32);
    eraseButton.parent("controls");
    eraseButton.style("color", "black");
    eraseButton.mousePressed(switchDrawMode);

    saveButton = p5.createButton("SAVE");
    saveButton.size(80, 32);
    saveButton.parent("controls");
    saveButton.style("color", "black");
    saveButton.mousePressed(closeCanvas);

    downloadButton = p5.createButton("DOWNLOAD PNG");
    downloadButton.size(150, 32);
    downloadButton.parent("controls");
    downloadButton.style("color", "black");
    downloadButton.mousePressed(download);

    clearButton = p5.createButton("CLEAR");
    clearButton.size(80, 32);
    clearButton.parent("controls");
    clearButton.style("color", "black");
    clearButton.mousePressed(clean);

    let transparentColor = p5.color(255, 255, 255, 0);
    for (let j = 0; j < numSquaresHeight; j++) {
      appearance[j] = [];
      for (let i = 0; i < numSquaresWidth; i++) {
        appearance[j][i] = transparentColor;
      }
    }

    isSetupComplete = true;
  };

  function updateCanvasSize() {
    canvasWidth = p5.min(p5.windowWidth, p5.windowHeight) * 0.9;
    canvasHeight = (canvasWidth / numSquaresWidth) * numSquaresHeight;
    squareSize = canvasWidth / numSquaresWidth;
  }

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
    let buttonText = eraseMode ? "DRAW MODE" : "ERASE MODE";
    eraseButton.html(buttonText);
  }

  function clean() {
    createGrid();
    let transparentColor = p5.color(255, 255, 255, 0);
    for (let j = 0; j < numSquaresHeight; j++) {
      for (let i = 0; i < numSquaresWidth; i++) {
        appearance[j][i] = transparentColor;
      }
    }
  }

  function download(filename = "myCharacter") {
    if (isSetupComplete && canvas) {
      p5.saveCanvas(filename + ".png");
    }
  }

  let prevX: number | null = null;
  let prevY: number | null = null;

  p5.mousePressed = () => {
    if (!isSetupComplete || !isDrawingEnabled) return;
    prevX = snap(p5.mouseX);
    prevY = snap(p5.mouseY);
    fillSquare(prevX, prevY);
  };

  p5.mouseDragged = () => {
    if (!isSetupComplete || !isDrawingEnabled) return;
    const x = snap(p5.mouseX);
    const y = snap(p5.mouseY);
    if (prevX !== null && prevY !== null) {
      drawLine(prevX, prevY, x, y);
    }
    prevX = x;
    prevY = y;
  };

  p5.mouseReleased = () => {
    if (!isDrawingEnabled) return;
    prevX = null;
    prevY = null;
  };

  p5.touchStarted = () => {
    if (!isDrawingEnabled) return false;
    p5.mousePressed();
  };

  p5.touchMoved = () => {
    if (!isDrawingEnabled) return false;
    p5.mouseDragged();
    return false;
  };

  p5.touchEnded = () => {
    if (!isDrawingEnabled) return false;
    p5.mouseReleased();
  };

  function redrawCanvas() {
    for (let y = 0; y < numSquaresHeight; y++) {
      for (let x = 0; x < numSquaresWidth; x++) {
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
    if (!isDrawingEnabled) {
      p5.fill(0, 0, 0, 100);
      p5.rect(0, 0, canvasWidth, canvasHeight);
      p5.fill(255);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(32);
      p5.text("Drawing Disabled", canvasWidth / 2, canvasHeight / 2);
    }
  };

  p5.updateWithProps = (props: SketchProps) => {
    if (props.isDrawingEnabled !== undefined) {
      isDrawingEnabled = props.isDrawingEnabled;
    }
    if (props.closeCanvas !== undefined) {
      closeCanvas = props.closeCanvas;
    }
  };

  function snap(p: number): number {
    return Math.floor(p / squareSize);
  }

  function drawLine(x0: number, y0: number, x1: number, y1: number) {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      fillSquare(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
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
      x >= numSquaresWidth ||
      y < 0 ||
      y >= numSquaresHeight
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
};
