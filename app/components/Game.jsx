"use client";
import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";

class Ball {
  constructor(x, y, radius, ctx) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.ctx = ctx;
    this.image = new Image();

    // Randomly select an image
    // const images = [
    //   "/karina1.jpeg",
    //   "/karina2.jpg",
    //   "/karina3.jpeg",
    //   "winter1.jpg",
    //   "winter2.gif",
    //   "winter3.jpg",
    // ];
    // this.image.src = images[Math.floor(Math.random() * images.length)];
    this.image.src = "/fries.png";
  }

  draw() {
    this.ctx.drawImage(
      this.image,
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
  }

  update() {
    this.y += 6;
  }
}

class Basket {
  constructor(x, y, width, height, ctx) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.image = new Image();
    this.image.src = "/basket.png";
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
  const videoRef = useRef(null);
  const [caughtCount, setCaughtCount] = useState(0);

  const handleMove = (indexFingerTip) => {
    const sensitivity = 4;

    basket.current.x =
      (indexFingerTip[0] - basket.current.width / 2) * sensitivity;

    const canvasWidth = canvasRef.current.width;
    basket.current.x = Math.max(
      0,
      Math.min(canvasWidth - basket.current.width, basket.current.x)
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const initialX = canvas.width / 2 - 50;
    basket.current = new Basket(initialX, 400, 100, 100, ctx);

    // Delay ball creation by 5 seconds
    const startCreatingBalls = setTimeout(() => {
      const createBalls = setInterval(() => {
        const ball = new Ball(Math.random() * canvas.width, 90, 90, ctx);
        balls.current.push(ball);
      }, 1000);

      // Clear the interval on component unmount
      return () => clearInterval(createBalls);
    }, 5000); // 5000 ms = 5 seconds

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      basket.current.draw();

      for (let i = balls.current.length - 1; i >= 0; i--) {
        const ball = balls.current[i];
        ball.update();
        ball.draw();

        if (basket.current.collidesWith(ball)) {
          setCaughtCount((prev) => prev + 1);
          balls.current.splice(i, 1);
        }

        if (ball.y > canvas.height) {
          balls.current.splice(i, 1);
        }
      }

      requestAnimationFrame(update);
    };

    update();

    const setupCamera = async () => {
      const video = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();
    };

    const loadHandposeModel = async () => {
      const model = await handpose.load();
      detectHand(model);
    };

    const detectHand = async (model) => {
      const video = videoRef.current;

      const predictHandPosition = async () => {
        const predictions = await model.estimateHands(video);
        if (predictions.length > 0) {
          const hand = predictions[0];
          const indexFingerTip = hand.landmarks[8];
          handleMove(indexFingerTip);
        }
        requestAnimationFrame(() => predictHandPosition(model));
      };

      predictHandPosition(model);
    };

    setupCamera();
    loadHandposeModel();

    // Clear timeout on component unmount
    return () => clearTimeout(startCreatingBalls);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight * 0.7;
    };

    handleResize();
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
      <video ref={videoRef} style={{ display: "none" }}></video>
      <div className="mt-24 text-md font-bold">
        My Wives Caught Count: {caughtCount}
      </div>
    </div>
  );
};

export default Game;
