"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { Character } from "@/game/types";
import { socket } from "@/socket";
import { send_event, single_event } from "@/websocket/events";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPencil } from "react-icons/fa6";

export default function DisplayCharacter() {
  const [info, setInfo] = useState<Character | null>(null);
  const [disabled, setDisabled] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const continueRound = async () => {
    send_event(socket, "continue_round");
    setDisabled(true);
    await single_event(socket, "start_drawing");

    const name = searchParams.get("name") ?? "Player";
    const roomCode = searchParams.get("room") ?? "ABCDEF";
    const playerNum = searchParams.get("player") ?? "1";
    router.push(`/drawing/ability?name=${encodeURIComponent(name)}&room=${roomCode}&player=${playerNum}`);
  };

  // Wait for character_info event from the server
  // May take a while due to AI generation
  useEffect(() => {
    const fetchCharacterInfo = async () => {
      const { info } = await single_event(socket, "character_info");
      setInfo(info);
    };
    fetchCharacterInfo();
  }, []);

  return (
    <div className="flex h-screen min-h-screen flex-col items-center justify-center space-y-8 bg-[#FEFEC8]">
      {info === null ? (
        <TypographyP className="text-2xl font-bold text-black">Generating character...</TypographyP>
      ) : <>
        <button
          disabled={disabled}
          onClick={continueRound}
          className={`flex w-80 transform items-center justify-center rounded-xl py-2 text-2xl font-bold text-white shadow-lg transition-transform ${
            disabled ? "cursor-not-allowed bg-gray-400" : "bg-green-500 hover:bg-green-600 hover:scale-105"
          }`}
        >
          <FaPencil className="mr-4 text-1xl" />
          Draw First Ability
        </button>

        <Card
          style={{
            backgroundColor: "#FEFEC8",
            border: "2px solid #51210A",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "16px",
            padding: "20px",
            minHeight: "400px",
            minWidth: "300px",
            overflow: "hidden",
            marginLeft: "10px",
            marginRight: "10px",
            color: "black",
          }}
        >
          <CardHeader className="mb-2 flex flex-col items-center">
            <CardTitle>Character: {info.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex">
            <div className="w-1/2 flex justify-center items-center">
              <Image src={info.img} alt={info.name} width={250} height={200} />
            </div>
            <div className="w-1/2 flex flex-col justify-between border-l-2 border-black p-8">
              <div className="space-y-2 height-full">
                <TypographyP className="border-b-2 border-black pb-2">HP: {info.hp}</TypographyP>
                <TypographyP className="border-b-2 border-black pb-2">DEF: {info.def}</TypographyP>
                <TypographyP className="border-b-2 border-black pb-2">STR: {info.str}</TypographyP>
              </div>
            </div>
          </CardContent>
          <TypographyP className="text-left mt-2">{info.description}</TypographyP>
        </Card>
      </>}
    </div>
  );
}
