"use client"; 
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaLink, FaPlay } from "react-icons/fa";

export default function Room() {
  const [name, setName] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  const handleCopy = () => {
    const roomLink = window.location.href;
    navigator.clipboard.writeText(roomLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleSubmit = () => {
    if (name) {
      router.push(`/character?name=${encodeURIComponent(name)}`);
    } else {
      alert("Please enter a character name.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FEFEC8] space-y-8 pt-16">
        <img src="/InkSmash1.png" alt="InkSmash Logo" className="w-80 mb-10"/>

      <button onClick={handleCopy}  className="flex items-center justify-center w-60 py-4 bg-blue-600 rounded-xl text-white text-lg font-bold shadow-lg transform transition-transform hover:scale-105">
        <FaLink className="mr-4 text-lg" />
        <div>
          Invite Friends
        </div>
      </button>

      {copySuccess && <p className="text-green-500">Link copied to clipboard!</p>}

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
