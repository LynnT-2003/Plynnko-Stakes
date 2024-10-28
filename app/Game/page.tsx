"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/Button";
import Game from "@/app/components/Game";

const App = () => {
  const [gameStart, setGameStart] = useState(false);
  const [points, setPoints] = useState(0);
  const [finalPoints, setFinalPoints] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const gameDuration = 25;
  const pointsRef = useRef(points);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    let countdown: NodeJS.Timeout | undefined;

    if (gameStart) {
      setRemainingTime(gameDuration);
      countdown = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timer = setTimeout(() => {
        setGameStart(false);
        setFinalPoints(pointsRef.current);
      }, gameDuration * 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (countdown) clearInterval(countdown);
    };
  }, [gameStart]);

  const handlePointsUpdate = (newPoints: React.SetStateAction<number>) => {
    setPoints(newPoints);
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
          <div className="w-screen h-full z-0">
            <Game />
          </div>
        )}
      </div>

      {!gameStart && finalPoints != null && (
        <div className="text-center mt-4">
          <p>Game Over! Final Score: {finalPoints}</p>
        </div>
      )}

      {gameStart && (
        <div className="text-center mt-4 z-10">
          <p>Time Remaining: {remainingTime} seconds</p>
        </div>
      )}
    </div>
  );
};

export default App;
