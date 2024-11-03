"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ReactP5Wrapper, SketchProps } from "@p5-wrapper/react";
import p5Types from "p5";

interface CanvasProps {
  initialTime: number;
  timeRemaining: number;
  export_callback?: (imageBlob: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ initialTime, timeRemaining, export_callback = () => {} }) => {
  const [showCanvas, setShowCanvas] = useState<boolean>(true);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState<boolean>(true);

  const { canvas, sketch } = useMemo(() => {
    const canvas = new P5Sketch();
    return {canvas, sketch: canvas.sketch.bind(canvas)};
  }, []);

  useEffect(() => {
    if(timeRemaining <= 0) {
      setIsDrawingEnabled(false);
      export_callback(canvas.download());
    }
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
              marginBottom: "20px",
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

class P5Sketch {
  private p5: p5Types | null;
  private squareSize: number;
  private numSquaresWidth = 80;
  private numSquaresHeight = Math.floor(1.5 * this.numSquaresWidth);
  private canvasWidth: number;
  private canvasHeight: number;
  private appearance: p5Types.Color[][] = [];
  private backgroundColor: p5Types.Color;
  private eraseMode = false;
  private colorPicker: p5Types.Element;
  private eraseButton: p5Types.Element;
  private canvas: p5Types.Graphics;
  private isSetupComplete = false;
  private isDrawingEnabled = true;
  private closeCanvas: () => void;

  constructor() {
    this.p5 = null;
    this.squareSize = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
  }

  public sketch(p5: p5Types) {
    p5.setup = () => {
      this.p5 = p5;

      this.updateCanvasSize(p5);
      const cnv = p5.createCanvas(this.canvasWidth, this.canvasHeight);
      cnv.parent("canvas-container");
      this.canvas = p5.createGraphics(this.canvasWidth, this.canvasHeight);
      this.backgroundColor = p5.color(255);
      this.canvas.background(this.backgroundColor);
      this.createGrid();

      this.colorPicker = p5.createColorPicker("#49DFFD");
      this.colorPicker.parent("controls");
      this.colorPicker.size(50, 28);

      this.eraseButton = p5.createButton("Erase");
      this.eraseButton.size(100, 32);
      this.eraseButton.parent("controls");
      this.eraseButton.style("color", "black");
      this.eraseButton.mousePressed(this.switchDrawMode.bind(this));

      const clearButton = p5.createButton("Clear");
      clearButton.size(80, 32);
      clearButton.parent("controls");
      clearButton.style("color", "black");
      clearButton.mousePressed(this.clean.bind(this));

      const transparentColor = p5.color(255, 255, 255, 0);
      for (let j = 0; j < this.numSquaresHeight; j++) {
        this.appearance[j] = [];
        for (let i = 0; i < this.numSquaresWidth; i++) {
          this.appearance[j][i] = transparentColor;
        }
      }

      let prevX: number | null = null;
      let prevY: number | null = null;

      p5.mousePressed = () => {
        if (!this.isSetupComplete || !this.isDrawingEnabled) return;
        prevX = this.snap(p5.mouseX);
        prevY = this.snap(p5.mouseY);
        this.fillSquare(p5, prevX, prevY);
      };

      p5.mouseDragged = () => {
        if (!this.isSetupComplete || !this.isDrawingEnabled) return;
        const x = this.snap(p5.mouseX);
        const y = this.snap(p5.mouseY);
        if (prevX !== null && prevY !== null) {
          this.drawLine(p5, prevX, prevY, x, y);
        }
        prevX = x;
        prevY = y;
      };

      p5.mouseReleased = () => {
        if (!this.isDrawingEnabled) return;
        prevX = null;
        prevY = null;
      };

      p5.touchStarted = () => {
        if (!this.isDrawingEnabled) return false;
        p5.mousePressed();
      };

      p5.touchMoved = () => {
        if (!this.isDrawingEnabled) return false;
        p5.mouseDragged();
        return false;
      };

      p5.touchEnded = () => {
        if (!this.isDrawingEnabled) return false;
        p5.mouseReleased();
      };

      p5.draw = () => {
        p5.image(this.canvas, 0, 0);
        if (!this.isDrawingEnabled) {
          p5.fill(0, 0, 0, 100);
          p5.rect(0, 0, this.canvasWidth, this.canvasHeight);
          p5.fill(255);
          p5.textAlign(p5.CENTER, p5.CENTER);
          p5.textSize(32);
          p5.text("Time's Up!", this.canvasWidth / 2, this.canvasHeight / 2);
        }
      };

      p5.updateWithProps = (props: SketchProps) => {
        if (props.isDrawingEnabled !== undefined) {
          this.isDrawingEnabled = props.isDrawingEnabled;
        }
        if (props.closeCanvas !== undefined) {
          this.closeCanvas = props.closeCanvas;
        }
      };

      this.isSetupComplete = true;
    };
  }

  private updateCanvasSize(p5: p5Types) {
    this.canvasWidth = p5.min(p5.windowWidth, p5.windowHeight) * 0.9;
    this.canvasHeight = (this.canvasWidth / this.numSquaresWidth) * this.numSquaresHeight;
    this.squareSize = this.canvasWidth / this.numSquaresWidth;
  }

  private createGrid() {
    this.canvas.background(this.backgroundColor);
    this.canvas.strokeWeight(1);
    this.canvas.stroke(150);
  }

  private switchDrawMode() {
    this.eraseMode = !this.eraseMode;
    const buttonText = this.eraseMode ? "Draw" : "Erase";
    this.eraseButton.html(buttonText);
  }

  private clean(p5: p5Types) {
    const transparentColor = p5.color(255, 255, 255, 0);
    for (let j = 0; j < this.numSquaresHeight; j++) {
      for (let i = 0; i < this.numSquaresWidth; i++) {
        this.appearance[j][i] = transparentColor;
      }
    }
    this.createGrid();
  }

  public download() {
    // TODO: Flood fill the canvas to remove any white spaces
    if (this.isSetupComplete && this.canvas) {
      const imageBlob = (this.p5!.get() as unknown as {
        canvas: HTMLCanvasElement
      }).canvas.toDataURL();
      return imageBlob;
    }
    return "";
  }

  private redrawCanvas() {
    for (let y = 0; y < this.numSquaresHeight; y++) {
      for (let x = 0; x < this.numSquaresWidth; x++) {
        if (this.appearance[y][x].levels[3] !== 0) {
          this.canvas.fill(this.appearance[y][x]);
          this.canvas.noStroke();
          this.canvas.square(x * this.squareSize, y * this.squareSize, this.squareSize);
        }
      }
    }
  }

  private snap(p: number): number {
    return Math.floor(p / this.squareSize);
  }

  private drawLine(p5: p5Types, x0: number, y0: number, x1: number, y1: number) {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      this.fillSquare(p5, x0, y0);
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

  private fillSquare(p5: p5Types, x: number, y: number) {
    if (
      !this.isSetupComplete ||
      !this.canvas ||
      !this.colorPicker ||
      x < 0 ||
      x >= this.numSquaresWidth ||
      y < 0 ||
      y >= this.numSquaresHeight
    ) {
      return;
    }

    try {
      if (this.eraseMode) {
        this.canvas.fill(this.backgroundColor);
        this.appearance[y][x] = p5.color(255, 255, 255, 0);
      } else {
        this.canvas.fill(this.colorPicker.color());
        this.appearance[y][x] = this.colorPicker.color();
      }
      this.canvas.noStroke();
      this.canvas.square(x * this.squareSize, y * this.squareSize, this.squareSize);
    } catch (error) {
      console.error("Error in fillSquare:", error);
    }
  }
}
