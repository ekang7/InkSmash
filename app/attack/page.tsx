"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Character } from "@/game/types";
import { useEffect, useState } from "react";
import { on_event, send_event, single_event } from "@/websocket/events";
import { socket } from "@/socket";

export default function Attack() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "Player";
  const roomCode = searchParams.get("room") ?? "ABCDEF";
  const playerNum = searchParams.get("player") ?? "1";
  const round = searchParams.get("round") ?? "0";

  const [info, setInfo] = useState<Character | null>(null);
  const [opp, setOppInfo] = useState<Character | null>(null);

  useEffect(() => {
    on_event(socket, "character_info", ({ info, player_num }) => {
      if(parseInt(playerNum, 10) === player_num) {
        setInfo(info);
      } else {
        setOppInfo(info);
      }
    });
  }, []);

  const attack = async (move_idx: number) => {
    send_event(socket, "use_move", { move_idx });
    const outcome = await single_event(socket, "attack");
    // TODO: Play anim
    send_event(socket, "continue_round");

    // Listen for possible outcomes
    on_event(socket, "start_drawing", () => {
      router.push(`/drawing/ability?name=${encodeURIComponent(name)}&room=${roomCode}&player=${playerNum}&round=${round}`);
    });
    on_event(socket, "end_game", ({ winner }) => {
      router.push(`/end?name=${encodeURIComponent(name)}&player=${playerNum}&winner=${winner}`);
    });
  }

  return (
    <>
      <div
        className="flex min-h-screen flex-col items-center space-y-4 bg-cover bg-center pt-10"
        style={{
          backgroundImage: "url('/background.png')",
        }}
      >
        {info && (
          <>
            <h1 className="rounded-lg bg-white/70 px-6 py-2 text-4xl font-bold text-black">Attack</h1>
            {info.moveset.map((move, index) => <div key={index}>
              <button
                key={index}
                disabled={opp === null}
                onClick={() => attack(index)}
                className={`flex w-80 transform items-center justify-start rounded-xl px-4 py-6 text-2xl font-bold text-white shadow-lg transition-transform ${
                  opp !== null ? "bg-blue-600 hover:scale-105" : "cursor-not-allowed bg-gray-400"
                }`}
              >
                <img src={move.img} alt={move.name} className="mr-4 h-16 w-16" />
                <div className="flex flex-col items-start">
                  {/*<span className="text-base font-semibold text-blue-100">{moveItem.damage} damage</span>*/}
                  <span>{move.name}</span>
                </div>
              </button>
            </div>)}
          </>
        )}
      </div>

      {/* GIF with health bar - Right */}
      <div className="absolute bottom-80 right-2 z-40 mb-10">
        {info && (
          <div className="relative flex flex-col items-center">
            <div className="mb-2 h-4 w-48 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-red-500" style={{ width: `${info.hp / info.max_hp}%` }}></div>
              {" "}
              {/* Adjust width for health level */}
            </div>
            <img src={info.img} />
          </div>
        )}
      </div>

      {/* GIF with health bar - Left */}
      <div className="absolute bottom-20 left-2 z-40 mb-10">
        {opp && (
          <div className="relative flex flex-col items-center">
            <div className="mb-2 h-4 w-64 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-red-500" style={{ width: `${opp.hp / opp.max_hp}%` }}></div>
              {/* Adjust width for health level */}
            </div>
            <img src={opp.img} />
          </div>
        )}
      </div>
    </>
  );
}
