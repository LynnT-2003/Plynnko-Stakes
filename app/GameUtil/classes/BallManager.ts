import {
  HEIGHT,
  WIDTH,
  ballRadius,
  obstacleRadius,
  sinkWidth,
} from "../constants";
import { Obstacle, Sink, createObstacles, createSinks } from "../objects";
import { pad, unpad } from "../padding";
import { Ball } from "./Ball";

export class BallManager {
  balls: Ball[];
  private canvasRef: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private obstacles: Obstacle[];
  public sinks: Sink[];
  private requestId?: number;
  private onFinish?: (index: number, startX?: number) => void;
  private isDraggingSink: boolean = false;
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;

  constructor(
    canvasRef: HTMLCanvasElement,
    onFinish?: (index: number, startX?: number) => void
  ) {
    this.balls = [];
    this.canvasRef = canvasRef;
    this.ctx = this.canvasRef.getContext("2d")!;
    this.obstacles = createObstacles();
    this.sinks = createSinks();
    this.update();
    this.onFinish = onFinish;

    this.initDragEvents();
  }

  // Method to get the current position of the last ball added
  getCurrentBallPosition() {
    if (this.balls.length === 0) return null;
    const lastBall = this.balls[this.balls.length - 1];
    return { x: lastBall.x, y: lastBall.y }; // Assuming Ball class has x, y properties
  }

  isBallWithinSinkBounds(index: number) {
    const ballPos = this.getCurrentBallPosition();
    const sink = this.sinks[index];
    if (!sink || !ballPos) return false;

    // Basic overlap check for bounding box
    return (
      ballPos.x >= sink.x &&
      ballPos.x <= sink.x + sink.width &&
      ballPos.y >= sink.y &&
      ballPos.y <= sink.y + sink.height
    );
  }

  initDragEvents() {
    this.canvasRef.addEventListener("mousedown", this.startDrag);
    this.canvasRef.addEventListener("mousemove", this.dragSink);
    this.canvasRef.addEventListener("mouseup", this.stopDrag);

    this.canvasRef.addEventListener("touchstart", this.startDrag);
    this.canvasRef.addEventListener("touchmove", this.dragSink);
    this.canvasRef.addEventListener("touchend", this.stopDrag);
  }

  startDrag = (event: MouseEvent | TouchEvent) => {
    const sink = this.sinks[0]; // Assuming we only drag the first sink
    const { clientX, clientY } = "touches" in event ? event.touches[0] : event;
    const rect = this.canvasRef.getBoundingClientRect();

    // Adjust coordinates based on canvas position
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check if the cursor is within the sink's bounds
    if (
      x >= sink.x &&
      x <= sink.x + sink.width &&
      y >= sink.y &&
      y <= sink.y + sink.height
    ) {
      this.isDraggingSink = true;
      this.dragOffsetX = x - sink.x;
      this.dragOffsetY = y - sink.y;
    }
  };

  dragSink = (event: MouseEvent | TouchEvent) => {
    if (!this.isDraggingSink) return;

    const { clientX, clientY } = "touches" in event ? event.touches[0] : event;
    const rect = this.canvasRef.getBoundingClientRect();

    // Adjust coordinates based on canvas position
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Update sink position based on drag
    const sink = this.sinks[0];
    sink.x = x - this.dragOffsetX;
    sink.y = y - this.dragOffsetY;

    // Redraw to update sink position
    this.draw();
  };

  stopDrag = () => {
    this.isDraggingSink = false;
  };

  addBall(startX?: number) {
    const newBall = new Ball(
      Math.random() * pad(WIDTH),
      pad(50),
      ballRadius,
      "red",
      this.ctx,
      this.obstacles,
      this.sinks,
      (index) => {
        this.balls = this.balls.filter((ball) => ball !== newBall);
        this.onFinish?.(index, startX);
      },
      this
    );
    this.balls.push(newBall);
  }

  drawObstacles() {
    this.ctx.fillStyle = "white";
    this.obstacles.forEach((obstacle) => {
      this.ctx.beginPath();
      this.ctx.arc(
        unpad(obstacle.x),
        unpad(obstacle.y),
        obstacle.radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      this.ctx.closePath();
    });
  }

  getColor(index: number) {
    if (index < 3 || index > this.sinks.length - 3) {
      return { background: "#ff003f", color: "white" };
    }
    if (index < 6 || index > this.sinks.length - 6) {
      return { background: "#ff7f00", color: "white" };
    }
    if (index < 9 || index > this.sinks.length - 9) {
      return { background: "#ffbf00", color: "black" };
    }
    if (index < 12 || index > this.sinks.length - 12) {
      return { background: "#ffff00", color: "black" };
    }
    if (index < 15 || index > this.sinks.length - 15) {
      return { background: "#bfff00", color: "black" };
    }
    return { background: "#7fff00", color: "black" };
  }

  // drawSinks() {
  //   this.ctx.fillStyle = "green";
  //   const SPACING = obstacleRadius * 2;
  //   for (let i = 0; i < this.sinks.length; i++) {
  //     this.ctx.fillStyle = this.getColor(i).background;
  //     const sink = this.sinks[i];
  //     this.ctx.font = "normal 13px Arial";
  //     this.ctx.fillRect(
  //       sink.x,
  //       sink.y - sink.height / 2,
  //       sink.width - SPACING,
  //       sink.height
  //     );
  //     this.ctx.fillStyle = this.getColor(i).color;
  //     this.ctx.fillText(
  //       sink?.multiplier?.toString() + "x",
  //       sink.x - 15 + sinkWidth / 2,
  //       sink.y
  //     );
  //   }
  // }
  drawSinks() {
    // Assume only one sink exists at index 0
    const sink = this.sinks[0]; // Access the first sink

    // Set color for the sink to orange
    this.ctx.fillStyle = "orange"; // Set to orange

    // Draw the sink as a rectangle
    this.ctx.fillRect(
      sink.x,
      sink.y - sink.height / 2,
      sink.width,
      sink.height
    );

    // Set text properties for drawing text
    this.ctx.fillStyle = "black"; // Text color
    this.ctx.font = "16px Arial"; // Font size and style

    // Measure text width for centering
    const text = "basket";
    const textWidth = this.ctx.measureText(text).width;

    // Calculate x position for centered text
    const textX = sink.x + (sink.width - textWidth) / 2;

    // Draw the text "basket" centered inside the sink
    this.ctx.fillText(text, textX, sink.y); // Positioning the text
  }

  draw() {
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.drawObstacles();
    this.drawSinks();
    this.balls.forEach((ball) => {
      ball.draw();
      ball.update();
    });
  }

  update() {
    this.draw();
    this.requestId = requestAnimationFrame(this.update.bind(this));
  }

  stop() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
  }

  displayMessageWhenBallLands(index: number, startX?: number) {
    const sink = this.sinks[index];
    console.log(
      `Ball landed at sink ${index + 1} with multiplier ${sink.multiplier}x`
    );

    const originalColor = this.ctx.fillStyle;
    const highlightColor = "blue";
    const SPACING = obstacleRadius * 2;

    this.ctx.fillStyle = highlightColor;
    this.ctx.fillRect(
      sink.x,
      sink.y - sink.height / 2,
      sink.width - SPACING,
      sink.height
    );

    setTimeout(() => {
      this.ctx.fillStyle = originalColor;
      this.ctx.fillRect(
        sink.x,
        sink.y - sink.height / 2,
        sink.width - SPACING,
        sink.height
      );
    }, 1000);
  }
}
