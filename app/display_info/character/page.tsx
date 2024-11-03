"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TypographyH1, TypographyP } from '@/components/ui/typography';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function DisplayCharacter() {
  // TODO: Get opponent info from server
  const [opponent_info, setOpponentInfo] = useState<{
    character_name: string,
    character_image_path: string,
    character_description: string
  }>({character_name: "Test", character_image_path: "test.png", character_description: "Test"});

  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      router.push('/select_ability');
    }

    const interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, router]);

  return (
    <div className="flex flex-col justify-center items-center h-screen min-h-screen bg-[#FEFEC8] space-y-8">
      {countdown > 0 && <TypographyH1 className="text-4xl font-bold text-black">{countdown}</TypographyH1>}
      <Card style={{
        backgroundColor: "#FEFEC8",
        border: "2px solid #000000",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        borderRadius: "16px",
        padding: "20px",
        minHeight: "400px",
        minWidth: "300px",
        overflow: "hidden"
      }}>
        <CardHeader className="flex flex-col items-center mb-2">
          <CardTitle>Opponent: {opponent_info.character_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Image src={`/characters/${opponent_info.character_image_path}`} alt={opponent_info.character_name} width={250} height={200} />
          <TypographyP className="text-left">{opponent_info.character_description}</TypographyP>
        </CardContent>
      </Card>
    </div>
  );
}
