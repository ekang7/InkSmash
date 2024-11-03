"use client"; 
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaLink, FaPlay } from "react-icons/fa";

export default function Room() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Player"; // Default to "Grace" for demonstration

  const [copySuccess, setCopySuccess] = useState(false);
  const [players, setPlayers] = useState([name]); // Track players in the room
  const [isPlayEnabled, setIsPlayEnabled] = useState(false);

  const handleCopy = () => {
    const roomLink = window.location.href;
    navigator.clipboard.writeText(roomLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleStart = () => {
    if (isPlayEnabled) {
      router.push(`/drawing?name=${encodeURIComponent(name)}`); // Redirect to "/room" on click if enabled
    }
  };

  // Simulate another player joining
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPlayers(prevPlayers => {
        if (prevPlayers.length < 2) {
          return [...prevPlayers, "Player 2"];
        }
        return prevPlayers;
      });
    }, 3000); // Simulate the second player joining after 3 seconds

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Enable the "Play Now" button once two players have joined
    setIsPlayEnabled(players.length === 2);
  }, [players]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FEFEC8] space-y-8 pt-16">
      <img src="/InkSmash1.png" alt="InkSmash Logo" className="w-80 mb-10"/>

      <h1 className="text-2xl font-bold text-black">Welcome, {name}!</h1>
      

      <button 
        onClick={handleCopy} 
        className="flex items-center justify-center w-60 py-4 bg-blue-600 rounded-xl text-white text-lg font-bold shadow-lg transform transition-transform hover:scale-105">
        <FaLink className="mr-4 text-lg" />
        <div>Invite Friends</div>
      </button>

      <p className="text-lg font-semibold text-gray-700">
        {players.length === 1 ? `${players[0]} joined` : `${players[0]} and ${players[1]} joined`}
      </p>

      <button 
        disabled={!isPlayEnabled}
        onClick={handleStart}
        className={`flex items-center justify-center w-80 py-6 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105 ${
          isPlayEnabled ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        <FaPlay className="mr-4 text-4xl" />
        <div>Start</div>
      </button>

      {copySuccess && <p className="text-green-500">Link copied to clipboard!</p>}
    </div>
  );
}
