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

    <div className=" flex flex-col items-center min-h-screen bg-[#FEFEC8] space-y-4">


      <div className="z-0">
          <h1 className="text-4xl font-bold text-black">Welcome, {name}!</h1>
          <p className="text-xl text-black">THIS IS EDWARDS PAGE.</p>
          <div className="z-10 relative top-10">
            <Canvas initialTime={10}/>
          </div>
      </div>
    </div>
    <div className="z-40 absolute top-40 h-10" >
        {showRound && <Round roundNumber={1} onHide={handleHideRound} />}
    </div>
    </>
  );
}
