"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Round from '@/components/ui/round';
import Canvas from '@/components/ui/canvas';
import { TypographyH1 } from '@/components/ui/typography';
import { on_event, send_event, single_event } from "@/websocket/events";
import { socket } from "@/socket";

export default function DrawingAbility() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "Player";
  const round = searchParams.get("round") ?? "0";
  const [showRound, setShowRound] = useState(true);

  const [roundNumber, setRoundNumber] = useState(0);
  useEffect(() => {
    const a = parseInt(round, 10);
    setRoundNumber(a + 1);
    localStorage.setItem("round_number", (a + 1).toString());
  }, []);

  const [timeRemaining, setTimeRemaining] = useState(20);

  // Hide overlay after a delay
  const handleHideRound = () => {
    setShowRound(false);
  };

  useEffect(() => {
    on_event(socket, "timer_drawing", ({time}) => {
      setTimeRemaining(time);
    });
  }, []);

  const onCanvasExport = async (imageBlob: string) => {
    console.log("Image blob:", imageBlob);
    await single_event(socket, "finish_drawing");
    send_event(socket, "submit_drawing", { blob: imageBlob });

    const roomCode = searchParams.get("room") ?? "ABCDEF";
    const playerNum = searchParams.get("player") ?? "1";
    // Skip ability select for first two rounds.
    if (roundNumber <= 2){
      router.push(`/attack?name=${encodeURIComponent(name)}&room=${roomCode}&player=${playerNum}&round=${roundNumber}`);
    } else {
      router.push(`/select_ability?name=${encodeURIComponent(name)}&room=${roomCode}&player=${playerNum}&round=${roundNumber}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FEFEC8] space-y-8">
      <div className="text-center mt-5">
        <TypographyH1 className="text-4xl font-bold text-black">Get drawing, {name}!</TypographyH1>
        {showRound && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <Round roundNumber={roundNumber} onHide={handleHideRound} customText="Draw your ability!" />
          </div>
        )}
        <div className="relative mt-8">
          <Canvas initialTime={20} timeRemaining={timeRemaining} export_callback={onCanvasExport} />
        </div>
      </div>
    </div>
  );
}
