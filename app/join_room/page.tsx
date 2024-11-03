"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { FaPlay } from "react-icons/fa";

export default function Room() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url_room_code = searchParams.get("room") ?? "";

  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState(url_room_code);

  const handleSubmit = async () => {
    if(!roomCode) {
      alert("Please enter a room code.");
      return;
    }
    if(!name) {
      alert("Please enter a character name.");
      return;
    }

    const res1 = await fetch(`/api/verify_code?code=${roomCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res1.ok) {
      alert("An error happened while joining the room, please try again.");
      return;
    }

    if((await res1.text()) === "false") {
      alert("Invalid room code.");
      return;
    }

    const res2 = await fetch(`/api/is_room_full?code=${roomCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res2.ok) {
      alert("An error happened while joining the room, please try again.");
      return;
    }

    if((await res2.text()) === "true") {
      alert("That room is full.");
      return;
    }

    router.push(`/waiting?name=${encodeURIComponent(name)}&room=${roomCode}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center space-y-8 bg-[#FEFEC8] pt-16">
      <img src="/InkSmash1.png" alt="InkSmash Logo" className="mb-10 w-80" />
      <div className="mt-10 flex flex-col items-center space-y-4">
        {/* Input Field */}
        <input
          type="text"
          onChange={(e) => setRoomCode(e.target.value)}
          value={roomCode}
          placeholder="Room code"
          className="text-blue w-80 rounded-xl px-6 py-4 text-lg placeholder-blue-300 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="text-blue w-80 rounded-xl px-6 py-4 text-lg placeholder-blue-300 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="flex w-80 transform items-center justify-center rounded-xl bg-green-500 py-6 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        <FaPlay className="mr-4 text-4xl" />
        <div>Play Now</div>
      </button>
    </div>
  );
}
