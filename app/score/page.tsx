"use client";

import { FaSquare, FaCircle } from "react-icons/fa"; 
import { FaDiamond } from "react-icons/fa6";
import { useState, useEffect } from 'react';

// export default function GameButtons() {
//   return (
//     <div className="flex flex-col items-center min-h-screen bg-[#FEFEC8] space-y-8 pt-16">
//       <div className="flex flex-col items-center space-y-6 mt-10">
//         {/* Play vs. Friend Button */}
//         <button className="flex items-center justify-start w-80 py-6 px-4 bg-blue-600 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105">
//           <FaCircle className="mr-4 text-4xl" />
//           <div className="flex flex-col items-start">
//             <span className="text-sm font-semibold text-blue-200">PLAY VS.</span>
//             <span>FRIEND</span>
//           </div>
//         </button>

//         {/* Play vs. Bot Button */}
//         <button className="flex items-center justify-start w-80 py-6 px-4 bg-blue-600 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105">
//           <FaSquare className="mr-4 text-4xl" />
//           <div className="flex flex-col items-start">
//             <span className="text-sm font-semibold text-blue-200">PLAY VS.</span>
//             <span>BOT</span>
//           </div>
//         </button>

//         {/* Play vs. World Button */}
//         <button className="flex items-center justify-start w-80 py-6 px-4 bg-blue-600 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105">
//           <FaDiamond className="mr-4 text-4xl" />
//           <div className="flex flex-col items-start">
//             <span className="text-sm font-semibold text-blue-200">PLAY VS.</span>
//             <span>WORLD</span>
//           </div>
//         </button>
//       </div>
//     </div>
//   );
// }


export default function GameButtons() {
  const [moves, setMoves] = useState([]);
  const [error, setError] = useState(null);

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
        console.log("OUTPUT OUTPUT: ", result.message.agenda.moves)
        setMoves(result.message.agenda.moves);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FEFEC8] space-y-8 pt-16">
      <span> {moves} </span>
      {error && <p className="text-red-500">Error: {error}</p>}

      { moves.map((move, index) => (
        <button
          key={index}
          className="flex items-center justify-start w-80 py-6 px-4 bg-blue-600 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105"
        >
          {/* Choose icon based on the index or content */}
          {index === 0 ? <FaCircle className="mr-4 text-4xl" /> :
           index === 1 ? <FaSquare className="mr-4 text-4xl" /> :
           <FaDiamond className="mr-4 text-4xl" />}
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-blue-300">PLAY VS.</span>
            <span> {move} </span>
          </div>
        </button>
      ))}
    </div>
  );
}
