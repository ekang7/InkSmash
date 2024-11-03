"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { Character } from "@/game/types";
import { socket } from "@/socket";
import { send_event, single_event } from "@/websocket/events";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DisplayCharacter() {
  const [info, setInfo] = useState<Character | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (loading) return;

    if (countdown <= 0) {
      (async () => {
        send_event(socket, "continue_round");
        await single_event(socket, "start_drawing");

        const name = searchParams.get("name") ?? "Player";
        const roomCode = searchParams.get("room") ?? "ABCDEF";
        const playerNum = searchParams.get("player") ?? "1";
        router.push(`/drawing/ability?name=${encodeURIComponent(name)}&room=${roomCode}&player=${playerNum}`);
      })();
    }

    const interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, countdown, router]);

  // Wait for character_info event from the server
  // May take a while due to AI generation
  useEffect(() => {
    const fetchCharacterInfo = async () => {
      const { info } = await single_event(socket, "character_info");
      setInfo(info);
      setLoading(false);
    };
    fetchCharacterInfo();
  }, []);

  return (
    <div className="flex h-screen min-h-screen flex-col items-center justify-center space-y-8 bg-[#FEFEC8]">
      {countdown > 0 && <TypographyH1 className="text-4xl font-bold text-black">{countdown}</TypographyH1>}
      {info === null ? (
        <TypographyP className="text-2xl font-bold text-black">Generating character...</TypographyP>
      ) : (
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
          }}
        >
          <CardHeader className="mb-2 flex flex-col items-center">
            <CardTitle>Opponent: {info.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Image src={info.img} alt={info.name} width={250} height={200} />
            <TypographyP className="text-left">{info.description}</TypographyP>
            <TypographyP className="text-left">{info.hp}</TypographyP>
            <TypographyP className="text-left">{info.def}</TypographyP>
            <TypographyP className="text-left">{info.str}</TypographyP>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
