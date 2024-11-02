"use client";

import { Button } from "@/components/ui/button";
import Canvas from "@/components/ui/canvas";
import { socket } from "@/socket";
import { on_event } from "@/websocket/events";
import { useState } from "react";
import "./globals.css";

export default function Home() {
  const [json, setJson] = useState<unknown>(null);
  const [error, setError] = useState(null);

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
      <Canvas initialTime={30}/>
      <div className="flex min-h-screen flex-col items-center space-y-14 bg-[#FEFEC8] pt-10">
        <img src="/InkSmash1.png" alt="InkSmash Logo" className="w-80" />
        {/* <img src="/InkSmash2.png" alt="InkSmash Logo" className="w-80 h-auto"/> */}
        {/*<Button onClick={handleClick}>Try connect</Button>*/}
        {/*<Canvas width={800} height={600} x={100} y={50} />*/}

        <div className="relative w-full max-w-[460px]">
          <iframe
            src="https://giphy.com/embed/3o6ZtdCeyBpLQ1J2aA"
            width="100%"
            height="258"
            // className="absolute top-0 left-0 w-full h-full"
            className="giphy-embed"
            allowFullScreen
          ></iframe>
          <div className="absolute inset-0"></div>
        </div>

        <div className="flex w-full max-w-sm flex-col items-center space-y-4">
          <button className="h-20 w-full rounded-lg bg-green-500 py-4 text-xl font-semibold text-white transition hover:bg-green-600">
            Play
          </button>
          <button className="w-full rounded-lg bg-blue-500 py-4 text-xl font-semibold text-white transition hover:bg-blue-600">
            Create a Private Room
          </button>
        </div>
      </div>
    </>
  );
}

{
  /* <p> <strong>API Response:</strong> {JSON.stringify(json)} </p> */
}
