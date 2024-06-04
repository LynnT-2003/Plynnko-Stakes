"use client"
import { useEffect, useRef, useState } from "react";
import { BallManager } from "../GameUtil/classes/BallManager";
import { outcomes } from './outcomes';
import { multipliers } from "./outcomes";
import Button from '@mui/material/Button';

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
  const [balance, setBalance] = useState(0); // Initial balance
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const onFinish = (index: number, startX?: number) => {
        const sink = ballManager?.sinks[index];
        const multiplier = sink?.multiplier || 1;
        setBalance(prevBalance => {
          const newBalance = prevBalance * multiplier;
          console.log(`Balance: ${newBalance}`);
          return newBalance;
        });
      };

      const ballManager = new BallManager(canvasRef.current, onFinish);
      setBallManager(ballManager);
    }
  }, [canvasRef]);

  return (
    <div className="flex justify-center items-center">
      <canvas ref={canvasRef} width="800" height="800"></canvas>
      <Button variant="contained" color="success" onClick={() => {
        const result = calculateGameResult();
        if (ballManager) {
          ballManager.addBall(result.point);
        }
      }}>Add ball</Button>
    </div>
  );
}
