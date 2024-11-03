"use client";

import { FaSquare, FaCircle } from "react-icons/fa"; 
import { FaDiamond } from "react-icons/fa6";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';


export default function GameButtons() {
  const [moves, setMoves] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript: "Your transcript here",
            todoList: JSON.stringify(["item1", "item2"]),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const result = await response.json();
        console.log("OUTPUT OUTPUT: ", result.message.agenda.moves);
        setMoves(result.message.agenda.moves);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const handleAttackClick = (move) => {
    router.push(`/attack?move=${encodeURIComponent(move.move)}&damage=${move.damage}`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FEFEC8] space-y-8 pt-16">
        <iframe src="https://giphy.com/embed/12r4pHjvAOv48o" width="480" height="274" className="giphy-embed" allowFullScreen></iframe><p></p>
      {error && <p className="text-red-500">Error: {error}</p>}

      {moves.map((moveItem, index) => (
        <button
          key={index}
          onClick={() => handleAttackClick(moveItem)}
          className="flex items-center justify-start w-80 py-6 px-4 bg-blue-600 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105"
        >
          {/* Choose icon based on the index */}
          {index === 0 ? <FaCircle className="mr-4 text-4xl" /> :
           index === 1 ? <FaSquare className="mr-4 text-4xl" /> :
           <FaDiamond className="mr-4 text-4xl" />}
          <div className="flex flex-col items-start">
            <span className="text-base font-semibold text-blue-100">{moveItem.damage} damage</span>
            <span>{moveItem.move}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
