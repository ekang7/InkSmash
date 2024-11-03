"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Round from '@/components/ui/round';
import Canvas from '@/components/ui/canvas';
import { TypographyH1 } from '@/components/ui/typography';

export default function Drawing() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "Player";
  const [showRound, setShowRound] = useState(true);

  // Hide overlay after a delay
  const handleHideRound = () => {
    setShowRound(false);
  };

  return (
    <div className="min-h-screen bg-[#FEFEC8]">
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center mt-0">
        <TypographyH1 className="text-2xl font-bold text-black">Get drawing, {name}!</TypographyH1>
        {showRound && (
          <div className="fixed inset-0 flex items-center justify-center">
            <Round roundNumber={1} onHide={handleHideRound} customText={"Draw your character!"} />
          </div>
        )}
        <div className="relative mt-8">
          <Canvas initialTime={100} next_page="/score" />
        </div>
      </div>
    </div>
    </div>
  );
}
