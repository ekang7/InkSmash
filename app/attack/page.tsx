"use client";

import { useSearchParams } from 'next/navigation';

export default function Attack() {
  const searchParams = useSearchParams();
  const move = searchParams.get("move");
  const damage = searchParams.get("damage");

  return (
    <>
      <div
        className="flex flex-col items-center pt-10 min-h-screen space-y-4 bg-cover bg-center"
        style={{
          backgroundImage: "url('/background.png')",
        }}
      >
        <h1 className="text-4xl font-bold text-black bg-white/70 px-6 py-2 rounded-lg">Attack</h1>
        <p className="text-2xl bg-white/70 px-6 py-2 rounded-lg">
          Move: <span className="font-semibold text-blue-600">{move}</span>
        </p>
        <p className="text-2xl bg-white/70 px-6 py-2 rounded-lg">
          Damage: <span className="font-semibold text-red-600">{damage}</span>
        </p>
      </div>

      {/* GIF with health bar - Right */}
      <div className="absolute bottom-80 right-2 mb-10 z-40">
        <div className="relative flex flex-col items-center">
          <div className="w-48 bg-gray-100 rounded-full h-4 overflow-hidden mb-2">
            <div className="bg-red-500 h-full rounded-full" style={{ width: '80%' }}></div> {/* Adjust width for health level */}
          </div>
          <iframe
            src="https://giphy.com/embed/12r4pHjvAOv48o"
            width="200"
            className="giphy-embed"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* GIF with health bar - Left */}
      <div className="absolute bottom-20 left-2 mb-10 z-40">
        <div className="relative flex flex-col items-center">
          <div className="w-64 bg-gray-100 rounded-full h-4 overflow-hidden mb-2">
            <div className="bg-red-500 h-full rounded-full" style={{ width: '60%' }}></div> {/* Adjust width for health level */}
          </div>
          <iframe
            src="https://giphy.com/embed/12r4pHjvAOv48o"
            width="300"
            className="giphy-embed"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </>
  );
}
