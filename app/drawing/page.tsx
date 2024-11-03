"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Round from '@/components/ui/round';
import Canvas from '@/components/ui/canvas';

export default function Character() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Player";
  const [showRound, setShowRound] = useState(true);

  // Hide overlay after a delay
  const handleHideRound = () => {
    setShowRound(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FEFEC8] space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black">Get drawing, {name}!</h1>
          <div className="relative mt-8">
            <Canvas initialTime={100} />
          </div>
        </div>
      </div>
      <div className="absolute top-40 h-10 z-40">
        {showRound && <Round roundNumber={1} onHide={handleHideRound} />}
      </div>
    </>
  );
}
