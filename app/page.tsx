"use client";

import { Button } from "@/components/ui/button";
import Canvas from "@/components/ui/canvas";
import { socket } from "@/socket";
import { on_event } from "@/websocket/events";
import { useEffect, useState } from 'react';
import "./globals.css";
import { useRouter } from 'next/navigation';

import { FaUser, FaLink} from "react-icons/fa"; // Import icons from react-icons


export default function Home() {
  const [json, setJson] = useState<unknown>(null);
  const [error, setError] = useState(null);
  const router = useRouter(); 

  const handlePlayClick = () => {
    router.push('/room');
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch('/api/generate', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           transcript: "Your transcript here", // Replace with actual data
  //           todoList: JSON.stringify(["item1", "item2"]), // Replace with actual data
  //         }),
  //       });
  //
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch data from API");
  //       }
  //
  //       const result = await response.json();
  //       setJson(result);
  //     } catch (error) {
  //       setError(error.message);
  //     }
  //   };
  //
  //   fetchData();
  // }, []);

  const handleClick = () => {
    socket.auth.room = "test";
    socket.connect();

    console.log("a");
    on_event(socket, "start_game", () => {
      console.log("Game started");
    });
  };

  return (
    <>
      {/* <Canvas /> */}
    <div className="flex flex-col items-center min-h-screen pt-10 space-y-14 bg-[#FEFEC8]">
    <img src="/InkSmash1.png" alt="InkSmash Logo" className="w-80"/>

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

    <div className="flex flex-col items-center space-y-6 mt-10">
      <button onClick={handlePlayClick} className="flex items-center justify-center w-80 py-6 bg-green-500 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105">
        <FaUser className="mr-4 text-4xl" />
        <div>
          Play Now
        </div>
      </button>

      <button className="flex items-center justify-center w-80 py-6 bg-blue-600 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105">
        <FaLink className="mr-4 text-4xl" />
        <div>
          Join a Room
        </div>
      </button>
    </div>

  </div>
  </>
);
}

{
  /* <p> <strong>API Response:</strong> {JSON.stringify(json)} </p> */
}
