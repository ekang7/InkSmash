// File: components/ui/Round.js

"use client";
import { useEffect, useState } from 'react';
import '../../app/globals.css'; // Adjust path as necessary
import { TypographyH1, TypographyH2 } from './typography';

export default function Round({
  roundNumber = 1,
  onHide,
  customText = "",
}: {
  roundNumber: number,
  onHide: () => void
  customText: string,
}) {
  const [showRound, setShowRound] = useState(true);

  // Automatically hide the overlay after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
    //   if (onHide) {
    //     onHide();
    //   }
      setShowRound(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    showRound && (
      <div className="z-40 flex items-center flex-col justify-center animate-fadeInOut rounded-lg px-8 py-4 ">
        <TypographyH1 className="z-40 font-bold text-black transform scale-105 animate-float z-60">
          Round {roundNumber}
        </TypographyH1>
        <TypographyH2 className="z-40 font-bold text-black transform scale-105 animate-float z-60">
          {customText}
        </TypographyH2>
      </div>
    )
  );
}
