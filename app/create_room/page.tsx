"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlay } from "react-icons/fa";

export default function Room() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (name) {
      const res = await fetch('/api/create_room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        alert("An error happened while creating the room, please try again.");
        return;
      }

      const room_code = await res.text();

      router.push(`/waiting?name=${encodeURIComponent(name)}&room=${room_code}`);
    } else {
      alert("Please enter a character name.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FEFEC8] space-y-8 pt-16">
        <img src="/InkSmash1.png" alt="InkSmash Logo" className="w-80 mb-10"/>
      <div className="flex flex-col items-center mt-10 space-y-4">
      {/* Input Field */}
      <input
        type="text"
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-80 py-4 px-6 text-blue text-lg rounded-xl shadow-lg placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
    </div>

      <button onClick={handleSubmit} className="flex items-center justify-center w-80 py-6 bg-green-500 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105">
        <FaPlay className="mr-4 text-4xl" />
        <div>
          Play Now
        </div>
      </button>
    </div>
  );
}
