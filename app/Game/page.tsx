"use client"
import { useEffect, useRef, useState } from "react";
import { BallManager } from "../GameUtil/classes/BallManager";
import { outcomes } from './outcomes';
import { multipliers } from "./outcomes";
import Button from '@mui/material/Button';
import { TextField } from "@mui/material";

const TOTAL_DROPS = 16;

function calculateGameResult() {
  let outcome = 0;
  const pattern = [];
  for (let i = 0; i < TOTAL_DROPS; i++) {
    if (Math.random() > 0.5) {
      pattern.push('R');
      outcome++;
    } else {
      pattern.push('L');
    }
  }

  const multiplier = multipliers[outcome];
  const possibleOutcomes = outcomes[outcome];

  return {
    point: possibleOutcomes[Math.floor(Math.random() * possibleOutcomes.length || 0)],
    multiplier,
    pattern
  };
}

export default function Game() {
  const [ballManager, setBallManager] = useState<BallManager | null>(null);
  const [balance, setBalance] = useState(0);
  const [bettingAmount, setBettingAmount] = useState(0);
  const [multiplier, setMultiplier] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const onFinish = (index: number, startX?: number) => {
        const sink = ballManager?.sinks[index];
        const multiplier = sink?.multiplier || 1;
        setBalance(prevBalance => {
          const amountWon = Math.round((bettingAmount * multiplier) * 100) / 100;
          const newBalance = Math.round((prevBalance + amountWon) * 100) / 100;

          console.log("Previous balance: ", prevBalance);
          console.log("Landed on multiplier: ", multiplier);
          console.log("Betting amount was: ", bettingAmount);
          console.log("Adding to balance: ", amountWon);
          console.log("Updated balance: ", newBalance);

          return newBalance;
        });
      };

      const ballManager = new BallManager(canvasRef.current, onFinish);
      setBallManager(ballManager);
    }
  }, [canvasRef, bettingAmount]);

  return (
    <div>
      <div className="flex justify-center items-center">
        <canvas ref={canvasRef} width="800" height="800"></canvas>
        <div className="flex-col space-y-8">

          <TextField
            className="w-full"
            onChange={(e) => setBalance(Number(e.target.value))}
            value={balance}
            type="number"
            label="Balance (Baht)"
            InputProps={{
              className: "text-white"
            }}
            InputLabelProps={{
              className: "text-white"
            }}
          />
          
          <TextField
            className="w-full text-white"
            onChange={(e) => setBettingAmount(Number(e.target.value))}
            value={bettingAmount}
            type="number"
            label="Betting Amount (Baht)"
            InputProps={{
              className: "text-white"
            }}
            InputLabelProps={{
              className: "text-white"
            }}
          />

          <Button variant="contained" color="success" onClick={() => {
            const result = calculateGameResult();
            if (ballManager) {
              ballManager.addBall(result.point);
            }
            setBalance(balance - bettingAmount)
            console.log("Remaining amount after betting: ", balance)
          }}>Add ball</Button>

        </div>
      </div>
    </div>
    
  );
}
