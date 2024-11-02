"use client"; 

import { useEffect, useState } from 'react';
import { TypographyH2, TypographyP } from "@/components/ui/typography";
import "./globals.css";
import Canvas from "@/components/ui/canvas";

export default function Home() {
  const [json, setJson] = useState(null);
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
            transcript: "Your transcript here", // Replace with actual data
            todoList: JSON.stringify(["item1", "item2"]), // Replace with actual data
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const result = await response.json();
        setJson(result); 
      } catch (error) {
        setError(error.message); 
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Canvas />
    <div className="flex flex-col items-center min-h-screen pt-10 space-y-14 bg-[#FEFEC8]">
    <img src="/InkSmash1.png" alt="InkSmash Logo" className="w-80"/>
    {/* <img src="/InkSmash2.png" alt="InkSmash Logo" className="w-80 h-auto"/> */}

    <div className="relative w-full max-w-[460px] ">
      <iframe 
        src="https://giphy.com/embed/3o6ZtdCeyBpLQ1J2aA" 
        width="100%" 
        height="258"
        // className="absolute top-0 left-0 w-full h-full"
        className="giphy-embed"
        allowFullScreen>
      </iframe>
      <div className="absolute inset-0"></div>
    </div>
    
    <div className="flex flex-col items-center w-full max-w-sm space-y-4">
      <button className="w-full h-20 py-4 text-xl font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition">
        Play
      </button>
      <button className="w-full py-4 text-xl font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition">
        Create a Private Room
      </button>
    </div>
  </div>
  </>
);
}

{/* <p> <strong>API Response:</strong> {JSON.stringify(json)} </p> */}
