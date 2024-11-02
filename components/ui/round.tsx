// File: components/ui/Round.js

"use client";
import { useEffect } from 'react';
import '../../app/globals.css'; // Adjust path as necessary

export default function Round({ roundNumber = 1, onHide }) {
  // Automatically hide the overlay after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
    //   if (onHide) {
    //     onHide();
    //   }
    }, 2000);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <div className=" z-40 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fadeInOut">
      <div className="z-40 text-6xl font-bold text-black bg-[#2E2E2E] px-8 py-4 rounded-lg shadow-2xl transform scale-105 animate-float z-60">
        Round {roundNumber}
      </div>
    </div>
  );
}
