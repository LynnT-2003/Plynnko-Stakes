"use client"
import { useEffect, useRef, useState } from "react";
import { BallManager } from "../GameUtil/classes/BallManager";
import { outcomes } from './outcomes';
import { multipliers } from "./outcomes";
import { TextField } from "@mui/material";
import {Button} from "@mui/material";
import { Input } from "../components/ui/input";

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
      <div className="flex justify-center items-center" style={{height:"90vh"}}>
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
          
          <span>
            <h1 className="pl-3">Balance: {balance}</h1>
          </span>
          

          <div className="flex flex-col w-full space-x-2">
            <h1 className="pl-3 pb-2">Betting Amount:</h1>
            <Input type="number" placeholder="(THB)" 
            onChange={(e) => setBettingAmount(Number(e.target.value))}/>
          </div>

          <div className="flex flex-col space-y-2 pl-2">
            <Button variant="contained" color="success" onClick={() => {
              const result = calculateGameResult();
              if (ballManager) {
                ballManager.addBall(result.point);
              }
              setBalance(balance - bettingAmount)
              console.log("Remaining amount after betting: ", balance)
            }}>Add ball</Button>

            <Button variant="contained" color="primary">
              Top Up Balance
            </Button>
          </div>

        </div>
      </div>
    </div>
    
  );
}
