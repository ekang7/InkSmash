"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaLink, FaPlay } from "react-icons/fa";
import { socket } from "@/socket";
import { on_event, send_event, single_event } from "@/websocket/events";

export default function Room() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const name = searchParams.get("name") ?? "Player"; // Default to "Player" for demonstration
  const room_code = searchParams.get("room") ?? "ABCDEF"; // Default to "ABCDEF" for demonstration

  const [copySuccess, setCopySuccess] = useState(false);
  const [players, setPlayers] = useState([name]); // Track players in the room
  const [isPlayEnabled, setIsPlayEnabled] = useState(false);

  const handleCopy = () => {
    const roomLink = `${window.location.origin}/join_room?room=${room_code}`;
    navigator.clipboard.writeText(roomLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleStart = () => {
    if (isPlayEnabled) {
      send_event(socket, "start_game");
    }
  };

  useEffect(() => {
    // Enable the "Play Now" button once two players have joined
    setIsPlayEnabled(players.length === 2);
  }, [players]);

  // Connect to socket with our name and room code
  useEffect(() => {
    if(socket.connected) socket.disconnect();

    console.log("Connecting to room", room_code, "with name", name);
    socket.auth.room = room_code;
    socket.auth.name = name;
    socket.connect();

    on_event(socket, "connect_error", (error) => {
      alert(error.message);
      router.replace("/");
    });

    on_event(socket, "room_update", ({ player_1, player_2 }) => {
      console.log("Players in room", player_1, player_2);
      setPlayers([player_1, player_2].filter((player) => player !== null));
    });

    // Now that we set up the socket, we can wait for the server to start the game
    (async () => {
      const playerNum = (await single_event(socket, "set_player_num")).player_num;
      await single_event(socket, "start_drawing");
      router.push(`/drawing/character?name=${encodeURIComponent(name)}&room=${room_code}&player=${playerNum}`);
    })();
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center space-y-8 bg-[#FEFEC8] pt-16">
      <img src="/InkSmash1.png" alt="InkSmash Logo" className="mb-10 w-80" />

      <h1 className="text-2xl font-bold text-black">Welcome, {name}!</h1>

      <div className={"flex flex-col items-center"}>
        <button
          onClick={handleCopy}
          className="flex w-60 transform items-center justify-center rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          <FaLink className="mr-4 text-lg" />
          <div>Copy Invite Link</div>
        </button>
        <p className="text-lg font-semibold text-gray-700">
          Room Code: <span className="text-blue-600">{room_code}</span>
        </p>
      </div>

      <p className="text-lg font-semibold text-gray-700">
        {players.length === 1 ? `${players[0]} joined` : `${players[0]} and ${players[1]} joined`}
      </p>

      <button
        disabled={!isPlayEnabled}
        onClick={handleStart}
        className={`flex w-80 transform items-center justify-center rounded-xl py-6 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105 ${
          isPlayEnabled ? "bg-green-500 hover:bg-green-600" : "cursor-not-allowed bg-gray-400"
        }`}
      >
        <FaPlay className="mr-4 text-4xl" />
        <div>Start</div>
      </button>

      {copySuccess && <p className="text-green-500">Link copied to clipboard!</p>}
    </div>
  );
}
