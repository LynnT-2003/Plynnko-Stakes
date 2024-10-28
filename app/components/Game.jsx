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
    this.image.src = "/fries.png"; // Change the image source as needed
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
    this.y += 6; // Speed of the falling ball
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
    this.image.src = "/basket.png"; // Change the image source as needed
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
  const [countdown, setCountdown] = useState(5); // Countdown state
  const [gameStarted, setGameStarted] = useState(false); // State to track if game has started

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const initialX = canvas.width / 2 - 50;
    basket.current = new Basket(initialX, 400, 100, 100, ctx);

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownTimer);
          setGameStarted(true); // Start the game after countdown
          return 0; // End countdown
        }
        return prev - 1;
      });
    }, 1000);

    // Ball creation will start after countdown
    const createBalls = setInterval(() => {
      if (gameStarted) {
        const ball = new Ball(Math.random() * canvas.width, 90, 90, ctx);
        balls.current.push(ball);
      }
    }, 500); // Increase the frequency of ball creation

    // Clear intervals on component unmount
    return () => {
      clearInterval(countdownTimer);
      clearInterval(createBalls);
    };
  }, [gameStarted]);

  const update = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    basket.current.draw();

    for (let i = balls.current.length - 1; i >= 0; i--) {
      const ball = balls.current[i];
      ball.update();
      ball.draw();

      if (basket.current.collidesWith(ball)) {
        setCaughtCount((prev) => prev + 1);
        balls.current.splice(i, 1);
      }

      if (ball.y > canvasRef.current.height) {
        balls.current.splice(i, 1);
      }
    }

    requestAnimationFrame(update);
  };

  useEffect(() => {
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

    update();
  }, []);

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
      {/* Display countdown if greater than 0 */}
      {countdown > 0 && (
        <div className="absolute text-6xl font-bold">{countdown}</div>
      )}
    </div>
  );
};

export default Game;
