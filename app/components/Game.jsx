// "use client";
// import React, { useRef, useEffect, useState } from "react";
// import * as tf from "@tensorflow/tfjs";
// import * as handpose from "@tensorflow-models/handpose";

// class Ball {
//   constructor(x, y, radius, ctx) {
//     this.x = x;
//     this.y = y;
//     this.radius = radius;
//     this.ctx = ctx;
//     this.image = new Image();
//     this.image.src = "/fries.png"; // Change the image source as needed
//   }

//   draw() {
//     this.ctx.drawImage(
//       this.image,
//       this.x - this.radius,
//       this.y - this.radius,
//       this.radius * 2,
//       this.radius * 2
//     );
//   }

//   update() {
//     this.y += 6; // Speed of the falling ball
//   }
// }

// class Basket {
//   constructor(x, y, width, height, ctx) {
//     this.x = x;
//     this.y = y;
//     this.width = width;
//     this.height = height;
//     this.ctx = ctx;
//     this.image = new Image();
//     this.image.src = "/basket.png"; // Change the image source as needed
//   }

//   draw() {
//     this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
//   }

//   collidesWith(ball) {
//     return (
//       ball.x + ball.radius > this.x &&
//       ball.x - ball.radius < this.x + this.width &&
//       ball.y + ball.radius > this.y &&
//       ball.y - ball.radius < this.y + this.height
//     );
//   }
// }

// const Game = () => {
//   const canvasRef = useRef(null);
//   const balls = useRef([]);
//   const basket = useRef(null);
//   const videoRef = useRef(null);
//   const [caughtCount, setCaughtCount] = useState(0);
//   const [countdown, setCountdown] = useState(5); // Countdown state
//   const [gameStarted, setGameStarted] = useState(false); // State to track if game has started

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const initialX = canvas.width / 2 - 50;
//     basket.current = new Basket(initialX, 400, 100, 100, ctx);

//     const countdownTimer = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev === 1) {
//           clearInterval(countdownTimer);
//           setGameStarted(true); // Start the game after countdown
//           return 0; // End countdown
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     // Ball creation will start after countdown
//     const createBalls = setInterval(() => {
//       if (gameStarted) {
//         const ball = new Ball(Math.random() * canvas.width, 90, 90, ctx);
//         balls.current.push(ball);
//       }
//     }, 500); // Increase the frequency of ball creation

//     // Clear intervals on component unmount
//     return () => {
//       clearInterval(countdownTimer);
//       clearInterval(createBalls);
//     };
//   }, [gameStarted]);

//   const update = () => {
//     const ctx = canvasRef.current.getContext("2d");
//     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     basket.current.draw();

//     for (let i = balls.current.length - 1; i >= 0; i--) {
//       const ball = balls.current[i];
//       ball.update();
//       ball.draw();

//       if (basket.current.collidesWith(ball)) {
//         setCaughtCount((prev) => prev + 1);
//         balls.current.splice(i, 1);
//       }

//       if (ball.y > canvasRef.current.height) {
//         balls.current.splice(i, 1);
//       }
//     }

//     requestAnimationFrame(update);
//   };

//   useEffect(() => {
//     const setupCamera = async () => {
//       const video = videoRef.current;
//       // const stream = await navigator.mediaDevices.getUserMedia({ video: true });

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           width: { ideal: 640 }, // Set ideal width
//           height: { ideal: 360 }, // Set ideal height
//           // You can adjust the constraints further for quality/other requirements
//         },
//       });
//       video.srcObject = stream;
//       video.onloadedmetadata = () => video.play();
//     };

//     const loadHandposeModel = async () => {
//       const model = await handpose.load();
//       detectHand(model);
//     };

//     const detectHand = async (model) => {
//       const video = videoRef.current;

//       const predictHandPosition = async () => {
//         const predictions = await model.estimateHands(video);
//         if (predictions.length > 0) {
//           const hand = predictions[0];
//           const indexFingerTip = hand.landmarks[8];
//           handleMove(indexFingerTip);
//         }
//         requestAnimationFrame(() => predictHandPosition(model));
//       };

//       predictHandPosition(model);
//     };

//     setupCamera();
//     loadHandposeModel();

//     update();
//   }, []);

//   const handleMove = (indexFingerTip) => {
//     const sensitivity = 4;

//     basket.current.x =
//       (indexFingerTip[0] - basket.current.width / 2) * sensitivity;

//     const canvasWidth = canvasRef.current.width;
//     basket.current.x = Math.max(
//       0,
//       Math.min(canvasWidth - basket.current.width, basket.current.x)
//     );
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       const canvas = canvasRef.current;
//       canvas.width = window.innerWidth * 0.8;
//       canvas.height = window.innerHeight * 0.7;
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className="flex flex-col items-center justify-center h-[90vh] relative">
//       {/* Video to cover the entire background */}
//       <video
//         ref={videoRef}
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           objectFit: "cover", // Ensures the video covers the entire area
//           zIndex: -1, // Send video behind other content
//         }}
//         autoPlay
//         muted
//       />
//       <canvas
//         ref={canvasRef}
//         width={400}
//         height={700}
//         style={{
//           width: "80vw",
//           height: "70vh",
//           position: "relative",
//           zIndex: 1,
//         }} // Bring canvas to front
//       />
//       <div className="mt-24 text-md font-bold z-10">
//         My Wives Caught Count: {caughtCount}
//       </div>
//       {/* Display countdown if greater than 0 */}
//       {countdown > 0 && (
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
//           <p className="text-6xl font-bold text-white">{countdown}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Game;

"use client";
import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/facemesh";

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
    basket.current = new Basket(initialX, canvas.height - 300, 100, 90, ctx);

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

    const createBalls = setInterval(() => {
      if (gameStarted) {
        const ball = new Ball(Math.random() * canvas.width, 90, 80, ctx);
        balls.current.push(ball);
      }
    }, 3000); // Increase the frequency of ball creation

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

    const loadFacemeshModel = async () => {
      const model = await facemesh.load();
      detectFace(model);
    };

    const detectFace = async (model) => {
      const video = videoRef.current;

      const predictFacePosition = async () => {
        const predictions = await model.estimateFaces(video);
        if (predictions.length > 0) {
          const face = predictions[0].scaledMesh;
          const nose = face[2]; // Use the nose tip for head movement
          handleMove(nose);
        }
        requestAnimationFrame(() => predictFacePosition(model));
      };

      predictFacePosition(model);
    };

    setupCamera();
    loadFacemeshModel();

    update();
  }, []);

  const handleMove = (noseTip) => {
    const sensitivity = 10;

    basket.current.x = (noseTip[0] - 3 * basket.current.width) * sensitivity;

    const canvasWidth = canvasRef.current.width;
    basket.current.x = Math.max(
      0,
      Math.min(canvasWidth - basket.current.width, basket.current.x)
    );
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[90vh] relative">
      {/* Fullscreen video background */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
        className="absolute inset-0 object-cover w-full h-full z-0"
      />
      <canvas
        ref={canvasRef}
        width={200}
        height={700}
        style={{
          width: "40vw",
          height: "70vh",
          position: "relative",
          zIndex: 1,
        }}
      />
      <div className="mt-24 text-md font-bold z-10">
        Caught Count: {caughtCount}
      </div>
      {/* Display countdown if greater than 0 */}
      {countdown > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <p className="text-6xl font-bold">{countdown}</p>
        </div>
      )}
    </div>
  );
};

export default Game;
