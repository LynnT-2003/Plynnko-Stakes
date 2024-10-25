"use client";
import { useEffect, useRef, useState } from "react";
import { BallManager } from "../GameUtil/classes/BallManager";
import { outcomes } from "./outcomes";
import { multipliers } from "./outcomes";
import { TextField } from "@mui/material";
import { Button as ButtonMui } from "@mui/material";
import { Button as ButtonShadcn } from "../components/ui/buttonShadcn";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

const TOTAL_DROPS = 16;

function calculateGameResult() {
  let outcome = 0;
  const pattern = [];
  for (let i = 0; i < TOTAL_DROPS; i++) {
    if (Math.random() > 0.5) {
      pattern.push("R");
      outcome++;
    } else {
      pattern.push("L");
    }
  }

  const multiplier = multipliers[outcome];
  const possibleOutcomes = outcomes[outcome];

  return {
    point:
      possibleOutcomes[
        Math.floor(Math.random() * possibleOutcomes.length || 0)
      ],
    multiplier,
    pattern,
  };
}

export default function Game() {
  const [ballManager, setBallManager] = useState<BallManager | null>(null);
  const [balance, setBalance] = useState(0);
  const [bettingAmount, setBettingAmount] = useState(0);
  const [multiplier, setMultiplier] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAutoDropping, setIsAutoDropping] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const onFinish = (index: number, startX: any) => {
        const sink = ballManager?.sinks[index];

        if (sink) {
          const ballPos = ballManager.balls[0]; // Assuming you want the first ball's position
          const sinkMargin = 100; // Reduced margin for practical collision detection

          // Calculate the expanded bounds for the sink
          const expandedSinkBounds = {
            x: sink.x - sinkMargin,
            y: sink.y - sinkMargin,
            width: sink.width + 2 * sinkMargin,
            height: sink.height + 2 * sinkMargin,
          };

          // Improved collision detection logic
          const isColliding = (
            ballX: number,
            ballY: number,
            ballRadius: number
          ) => {
            return (
              ballX + ballRadius > expandedSinkBounds.x &&
              ballX - ballRadius <
                expandedSinkBounds.x + expandedSinkBounds.width &&
              ballY + ballRadius > expandedSinkBounds.y &&
              ballY - ballRadius <
                expandedSinkBounds.y + expandedSinkBounds.height
            );
          };

          // Log positions for debugging
          console.log("Ball Position:", ballPos);
          console.log("Expanded Sink Bounds:", expandedSinkBounds);

          // Check collision
          if (isColliding(ballPos.x, ballPos.y, ballPos.radius)) {
            const sinkMultiplier = sink.multiplier || 1;
            setBalance((prevBalance) => {
              const amountWon =
                Math.round(bettingAmount * sinkMultiplier * 100) / 100;
              const newBalance =
                Math.round((prevBalance + amountWon) * 100) / 100;

              console.log("Ball landed in sink. Balance updated:", newBalance);
              return newBalance;
            });
          } else {
            console.log(
              "Ball missed the sink. Re-check collision or adjust bounds."
            );
          }
        }
      };

      const ballManagerInstance = new BallManager(canvasRef.current, onFinish);
      setBallManager(ballManagerInstance);

      // Handle window resize to maintain canvas responsiveness
      const handleResize = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          ballManagerInstance.draw(); // Redraw after resizing
        }
      };

      window.addEventListener("resize", handleResize);

      // Cleanup on unmount
      return () => {
        window.removeEventListener("resize", handleResize);
        ballManagerInstance.stop();
      };
    }
  }, [canvasRef, bettingAmount]);

  useEffect(() => {
    if (isAutoDropping) {
      const intervalId = setInterval(() => {
        if (ballManager) {
          const result = calculateGameResult();
          ballManager.addBall(result.point);
          setBalance((prevBalance) => prevBalance - bettingAmount);
        }
      }, 1000);

      // Clear interval on component unmount or when auto-drop stops
      return () => clearInterval(intervalId);
    }
  }, [isAutoDropping, ballManager, bettingAmount, balance]);

  return (
    <div className="w-screen">
      <div className="flex flex-col md:flex-row justify-center items-center">
        <canvas ref={canvasRef} width="350" height="600"></canvas>
        <div className="hidden md:block flex-col space-y-8">
          <h1 className="pl-3">Balance: {balance}</h1>

          <div className="flex flex-col w-full space-x-2">
            <h1 className="pl-3 pb-2">Betting Amount:</h1>
            <Input
              type="number"
              placeholder="(THB)"
              onChange={(e) => setBettingAmount(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col space-y-2 pl-2">
            <ButtonMui
              variant="contained"
              color="success"
              onClick={() => {
                const result = calculateGameResult();
                if (ballManager) {
                  ballManager.addBall(result.point);
                }
                setBalance(balance - bettingAmount);
              }}
            >
              Drop ball
            </ButtonMui>

            <ButtonMui
              variant="contained"
              color="warning"
              onClick={() => setIsAutoDropping(!isAutoDropping)}
            >
              {isAutoDropping ? "Stop Auto-Drop" : "Start Auto-Drop"}
            </ButtonMui>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <ButtonMui
                  variant="contained"
                  color="primary"
                  onClick={() => setDialogOpen(true)}
                >
                  Top-Up Balance
                </ButtonMui>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Top-Up Balance</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      defaultValue="I am a loser gambling addict"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="topup-amount" className="text-right">
                      Amount (THB):
                    </Label>
                    <Input
                      id="topup-amount"
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                      type="number"
                      className="col-span-3"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <ButtonShadcn
                    type="submit"
                    onClick={() => {
                      setBalance((prevBalance) => prevBalance + topUpAmount);
                      setTopUpAmount(0);
                      setDialogOpen(false);
                    }}
                  >
                    Save Changes
                  </ButtonShadcn>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
