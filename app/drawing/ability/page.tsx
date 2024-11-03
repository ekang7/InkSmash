"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Round from '@/components/ui/round';
import Canvas from '@/components/ui/canvas';
import { TypographyH1 } from '@/components/ui/typography';

export default function DrawingAbility() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "Player";
  const [showRound, setShowRound] = useState(true);

  // TODO: STATE FOR ROUND NUMBER
  const [roundNumber, setRoundNumber] = useState(2);

  // Hide overlay after a delay
  const handleHideRound = () => {
    setShowRound(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FEFEC8] space-y-8">
      <div className="text-center mt-5">
        <TypographyH1 className="text-4xl font-bold text-black">Get drawing, {name}!</TypographyH1>
        {showRound && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <Round roundNumber={roundNumber} onHide={handleHideRound} customText="Draw your ability!" />
          </div>
        )}
        <div className="relative mt-8">
          <Canvas initialTime={30} next_page="/select_ability" />
        </div>
      </div>
    </div>
  );
}
