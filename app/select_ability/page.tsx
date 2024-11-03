"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Move } from "@/game/types";
import { send_event, single_event } from "@/websocket/events";
import { socket } from "@/socket";

export default function SelectAbility() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [moves, setMoves] = useState<Move[]>([]);
  const [newMove, setNewMove] = useState<Move>({ name: "", description: "", img: ""});

  useEffect(() => {
    const fetchMoves = async () => {
      const {current, new: newMove} = await single_event(socket, "choose_moves");
      setMoves(current);
      setNewMove(newMove);
    };
    fetchMoves();
  }, []);

  const handleMoveClick = (index: number) => {
    send_event(socket, "swap_move", { move_idx: index });

    const name = searchParams.get("name") ?? "Player";
    const roomCode = searchParams.get("room") ?? "ABCDEF";
    const playerNum = searchParams.get("player") ?? "1";
    const round = searchParams.get("round") ?? "0";
    router.push(`/attack?name=${encodeURIComponent(name)}&room=${roomCode}&player=${playerNum}&round=${round}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center space-y-8 bg-[#FEFEC8] pt-16">
      <img src="/InkSmash1.png" alt="InkSmash Logo" className="mb-10 w-80" />

      <button className="flex w-80 transform items-center justify-start rounded-xl bg-blue-600 px-4 py-6 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105">
        {/* Choose icon based on the index */}
        {/*<FaCircle className="mr-4 text-4xl" />*/}
        <img src={newMove.img} alt={newMove.name} className="mr-4 h-16 w-16" />
        <div className="flex flex-col items-start">
          {/*<span className="text-base font-semibold text-blue-100">{moveItem.damage} damage</span>*/}
          <span>{newMove.name}</span>
        </div>
      </button>

      {moves.map((moveItem, index) => (
        <button
          key={index}
          onClick={() => handleMoveClick(index)}
          className="flex w-80 transform items-center justify-start rounded-xl bg-blue-600 px-4 py-6 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          {/* Choose icon based on the index */}
          <img src={moveItem.img} alt={moveItem.name} className="mr-4 h-16 w-16" />
          <div className="flex flex-col items-start">
            {/*<span className="text-base font-semibold text-blue-100">{moveItem.damage} damage</span>*/}
            <span>{moveItem.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
