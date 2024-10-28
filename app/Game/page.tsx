"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/Button";
import Game from "@/app/components/Game";

const App = () => {
  const [gameStart, setGameStart] = useState(false);
  const [points, setPoints] = useState(0);
  const [finalPoints, setFinalPoints] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const gameDuration = 10; // Duration in seconds
  const pointsRef = useRef(points); // Ref to hold the latest points value

  useEffect(() => {
    pointsRef.current = points; // Update ref whenever points change
  }, [points]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    let countdown: NodeJS.Timeout | undefined;

    if (gameStart) {
      setRemainingTime(gameDuration); // Initialize remaining time
      countdown = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0; // Stop countdown
          }
          return prev - 1; // Decrement remaining time
        });
      }, 1000); // Update every second

      timer = setTimeout(() => {
        setGameStart(false); // End game after 10 seconds
        setFinalPoints(pointsRef.current); // Use the latest points value from ref
      }, gameDuration * 1000);
    }

    return () => {
      if (timer) clearTimeout(timer); // Cleanup timer
      if (countdown) clearInterval(countdown); // Cleanup countdown
    };
  }, [gameStart]);

  const handlePointsUpdate = (newPoints: React.SetStateAction<number>) => {
    setPoints(newPoints); // Update points from Game component
  };

  return (
    <div className="w-screen">
      <div className="flex h-[80vh] items-center justify-center">
        {!gameStart && (
          <Button
            onClick={() => setGameStart(true)}
            className="text-md px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            Start Game
          </Button>
        )}
        {gameStart && (
          <div className="w-screen h-full">
            <Game />
            {/* Make sure to pass the handler to the Game component */}
          </div>
        )}
      </div>

      {!gameStart && finalPoints != null && (
        <div className="text-center mt-4">
          <p>Game Over! Final Score: {finalPoints}</p>
        </div>
      )}

      {gameStart && (
        <div className="text-center mt-4">
          <p>Time Remaining: {remainingTime} seconds</p>
        </div>
      )}
    </div>
  );
};

export default App;
