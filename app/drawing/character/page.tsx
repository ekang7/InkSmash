"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Round from '@/components/ui/round';
import Canvas from '@/components/ui/canvas';
import { TypographyH1 } from '@/components/ui/typography';
import { on_event, send_event, single_event } from "@/websocket/events";
import { socket } from "@/socket";

export default function Drawing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "Player";
  const [showRound, setShowRound] = useState(true);

  const [timeRemaining, setTimeRemaining] = useState(30);

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
    router.push(`/display_info/character?name=${encodeURIComponent(name)}&room=${roomCode}&player=${playerNum}`);
  }

  return (
    <div className="min-h-screen bg-[#FEFEC8]">
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center mt-0">
        <TypographyH1 className="text-2xl font-bold text-black">Get drawing, {name}!</TypographyH1>
        {showRound && (
          <div className="fixed inset-0 flex items-center justify-center">
            <Round roundNumber={1} onHide={handleHideRound} customText={"Draw your character!"} />
          </div>
        )}
        <div className="relative mt-8">
          <Canvas initialTime={30} timeRemaining={timeRemaining} export_callback={onCanvasExport} />
        </div>
      </div>
    </div>
    </div>
  );
}
