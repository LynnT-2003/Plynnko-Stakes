"use client";
import React, { useRef, useEffect, useState } from "react";

class Ball {
  constructor(x, y, radius, ctx) {
    this.x = x; // Ball's x position
    this.y = y; // Ball's y position
    this.radius = 30; // Ball's radius
    this.ctx = ctx; // Canvas context for drawing
    this.image = new Image(); // Create a new Image object
    this.image.src = "/fries.png"; // Set the source to your fries image
  }

  draw() {
    this.ctx.drawImage(
      this.image,
      this.x - this.radius, // Adjust x position to center the image
      this.y - this.radius, // Adjust y position to center the image
      this.radius * 2, // Width of the image
      this.radius * 2 // Height of the image
    );
  }

  update() {
    this.y += 2; // Ball falls down
  }
}

class Basket {
  constructor(x, y, width, height, ctx) {
    this.x = x; // Basket's x position
    this.y = y; // Basket's y position
    this.width = width; // Basket's width
    this.height = 100; // Basket's height
    this.ctx = ctx; // Canvas context for drawing
    this.image = new Image();
    this.image.src = "/basket.png"; // Load the basket image
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  collidesWith(ball) {
    return (
      ball.x + ball.radius > this.x &&
      ball.x - ball.radius < this.x + this.width &&
      ball.y + ball.radius > this.y &&
      ball.y - ball.radius < this.y + this.height
    );
  }
}

const Game = () => {
  const canvasRef = useRef(null);
  const balls = useRef([]);
  const basket = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0); // For y offset
  const [caughtCount, setCaughtCount] = useState(0); // State for the caught balls counter

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const initialX = canvas.width / 2 - 50; // Center the basket (50 is half the width of the basket)
    basket.current = new Basket(initialX, 400, 100, 20, ctx); // Basket position and size

    const createBalls = setInterval(() => {
      const ball = new Ball(Math.random() * canvas.width, 0, 10, ctx);
      balls.current.push(ball);
    }, 1000); // New ball every second

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      basket.current.draw();

      for (let i = balls.current.length - 1; i >= 0; i--) {
        const ball = balls.current[i];
        ball.update();
        ball.draw();

        if (basket.current.collidesWith(ball)) {
          console.log("Ball caught!");
          setCaughtCount((prev) => prev + 1); // Increment the counter
          balls.current.splice(i, 1);
        }

        if (ball.y > canvas.height) {
          console.log("Ball missed!");
          balls.current.splice(i, 1);
        }
      }

      requestAnimationFrame(update);
    };

    update();

    // Mouse event handlers
    const handleMouseDown = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top; // Get mouse Y position

      // Check if mouse is within basket bounds
      if (
        mouseX >= basket.current.x &&
        mouseX <= basket.current.x + basket.current.width &&
        mouseY >= basket.current.y && // Add y-axis check
        mouseY <= basket.current.y + basket.current.height
      ) {
        setIsDragging(true);
        setOffsetX(mouseX - basket.current.x); // Calculate X offset
        setOffsetY(mouseY - basket.current.y); // Calculate Y offset
      }
    };

    const handleMouseMove = (event) => {
      if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top; // Get mouse Y position
        basket.current.x = mouseX - offsetX; // Update basket position
        basket.current.y = mouseY - offsetY; // Update basket Y position

        // Keep basket within canvas bounds
        basket.current.x = Math.max(
          0,
          Math.min(canvas.width - basket.current.width, basket.current.x)
        );
        basket.current.y = Math.max(
          0,
          Math.min(canvas.height - basket.current.height, basket.current.y)
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Touch event handlers
    const handleTouchStart = (event) => {
      const rect = canvas.getBoundingClientRect();
      const touchX = event.touches[0].clientX - rect.left;
      const touchY = event.touches[0].clientY - rect.top;

      // Check if touch is within basket bounds
      if (
        touchX >= basket.current.x &&
        touchX <= basket.current.x + basket.current.width &&
        touchY >= basket.current.y &&
        touchY <= basket.current.y + basket.current.height
      ) {
        setIsDragging(true);
        setOffsetX(touchX - basket.current.x);
        setOffsetY(touchY - basket.current.y);
      }
    };

    const handleTouchMove = (event) => {
      if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const touchX = event.touches[0].clientX - rect.left;
        const touchY = event.touches[0].clientY - rect.top;
        basket.current.x = touchX - offsetX;
        basket.current.y = touchY - offsetY;

        // Keep basket within canvas bounds
        basket.current.x = Math.max(
          0,
          Math.min(canvas.width - basket.current.width, basket.current.x)
        );
        basket.current.y = Math.max(
          0,
          Math.min(canvas.height - basket.current.height, basket.current.y)
        );
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    // Attach event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp); // Stop dragging if mouse leaves canvas

    // Touch event listeners
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchEnd); // Handle touch cancel

    return () => {
      clearInterval(createBalls);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      // Remove touch event listeners
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isDragging, offsetX, offsetY]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth * 0.8; // 80% of the viewport width
      canvas.height = window.innerHeight * 0.7; // 80% of the viewport height
    };

    handleResize(); // Set initial size

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[90vh]">
      <canvas
        ref={canvasRef}
        width={400}
        height={700}
        style={{ width: "80vw", height: "70vh" }}
      />
      <div className="mt-24 text-md font-bold">
        Fries Caught: {caughtCount} {/* Display the counter */}
      </div>
    </div>
  );
};

export default Game;
