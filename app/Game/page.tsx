"use client"
import { useEffect, useRef, useState } from "react";
import { BallManager } from "../GameUtil/classes/BallManager";
import { outcomes } from './outcomes';
import Button from '@mui/material/Button';

const TOTAL_DROPS = 16;

const MULTIPLIERS: { [key: number]: number } = {
  0: 16,
  1: 9,
  2: 2,
  3: 1.4,
  4: 1.4,
  5: 1.2,
  6: 1.1,
  7: 1,
  8: 0.5,
  9: 1,
  10: 1.1,
  11: 1.2,
  12: 1.4,
  13: 1.4,
  14: 2,
  15: 9,
  16: 16
};

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

  const multiplier = MULTIPLIERS[outcome];
  const possibleOutcomes = outcomes[outcome];

  return {
    point: possibleOutcomes[Math.floor(Math.random() * possibleOutcomes.length || 0)],
    multiplier,
    pattern
  };
}

export default function Game() {
  const [ballManager, setBallManager] = useState<BallManager>();
  const canvasRef = useRef<any>();

  useEffect(() => {
    if (canvasRef.current) {
      const ballManager = new BallManager(canvasRef.current as unknown as HTMLCanvasElement);
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
