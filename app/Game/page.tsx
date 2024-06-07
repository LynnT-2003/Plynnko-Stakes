"use client"
import { useEffect, useRef, useState } from "react";
import { BallManager } from "../GameUtil/classes/BallManager";
import { outcomes } from './outcomes';
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
} from "../components/ui/dialog"
import PreviousMap from "postcss/lib/previous-map";

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
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
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
          
          <span>
            <h1 className="pl-3">Balance: {balance}</h1>
          </span>
          

          <div className="flex flex-col w-full space-x-2">
            <h1 className="pl-3 pb-2">Betting Amount:</h1>
            <Input type="number" placeholder="(THB)" 
            onChange={(e) => setBettingAmount(Number(e.target.value))}/>
          </div>

          <div className="flex flex-col space-y-2 pl-2">
            <ButtonMui variant="contained" color="success" onClick={() => {
              const result = calculateGameResult();
              if (ballManager) {
                ballManager.addBall(result.point);
              }
              setBalance(balance - bettingAmount)
              console.log("Remaining amount after betting: ", balance)
            }}>Drop ball</ButtonMui>

            {/* <ButtonMui variant="contained" color="primary">
              Top Up Balance
            </ButtonMui> */}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>

              <DialogTrigger asChild>
                <ButtonMui variant="contained" color="primary" onClick={() => {
                  setDialogOpen(true)
                  console.log("Opening Dialog...")
                }}>
                  Top-Up Balance
                </ButtonMui>
              </DialogTrigger>

              <DialogContent>

                <DialogHeader>
                  <DialogTitle>
                    Are you sure you want to do this?
                  </DialogTitle>
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
                  <ButtonShadcn type="submit" onClick={() => {
                    setBalance(prevBalance => prevBalance + topUpAmount)
                    setTopUpAmount(0) // reset topup amount to zero
                    setDialogOpen(false) // close dialog box
                  }}>
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
