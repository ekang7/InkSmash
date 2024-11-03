"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TypographyH1, TypographyH2, TypographyH3, TypographyP } from '@/components/ui/typography';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DisplayCharacter() {
  // TODO: Get opponent info from server
  const [opponent_info, setOpponentInfo] = useState<{
    character_name: string,
    character_image_path: string,
    abilities: {
      ability_image_path: string
      ability_name: string,
      ability_description: string,
      ability_damage: number,
    }[]
  }>({
    character_name: "Character Name",
    character_image_path: "../../images/test.png",
    abilities: [{
      ability_image_path: "../../images/test.png",
      ability_name: "Ability 1",
      ability_description: "Super long ability description that is going to be a problem. But maybe not a problem???",
      ability_damage: 10
    }, {
      ability_image_path: "../../images/test.png",
      ability_name: "Ability 2",
      ability_description: "Super long ability description that is going to be a problem. But maybe not a problem???",
      ability_damage: 10
    }]
  });

  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/drawing/ability');
    }

    const interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, router]);

  return (
    <div className="flex flex-col justify-center items-center h-screen min-h-screen bg-[#FEFEC8] space-y-8">
      {countdown > 0 && <div className="grid grid-cols-5 items-center space-x-2">
        <TypographyH2 className="text-4xl font-bold text-black m-0 p-0 border-0 col-span-5">Your Opponent</TypographyH2>
        <TypographyH3 className="font-bold text-black m-0 p-0 border-0 col-span-5 text-center">{countdown}</TypographyH3>
      </div>}
      <Card style={{
        backgroundColor: "#FEFEC8",
        border: "2px solid #51210A",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        borderRadius: "16px",
        padding: "20px",
        paddingBottom: "0px",
        minHeight: "400px",
        minWidth: "300px",
        overflow: "hidden",
        marginLeft: "10px",
        marginRight: "10px"
      }}>
        <CardHeader className="flex flex-col items-center mb-2">
          <CardTitle>{opponent_info.character_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Image
            src={`/characters/${opponent_info.character_image_path}`}
            alt={opponent_info.character_name}
            width={250}
            height={200}
          />
          <div className="flex flex-col items-center space-y-2">
            {opponent_info.abilities.map((ability, index) => (
              <div key={index} className="grid grid-cols-5 gap-2" style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                border: "2px solid #51210A",
                borderRadius: "8px",
                padding: "5px",
                marginBottom: "10px"
              }}>
                <Image
                  src={`/abilities/${ability.ability_image_path}`}
                  alt={ability.ability_name}
                  width={25}
                  height={25}
                  className="col-span-1 max-h-[25px] max-w-[25px]"
                />
                <TypographyH3 className="text-left" style={{gridColumn: "span 3 / span 1"}}>
                  {ability.ability_name}
                </TypographyH3>
                <TypographyP className="text-right" style={{gridColumn: "span 1 / span 1", justifySelf: "center"}}>
                  {ability.ability_damage}
                </TypographyP>
                <TypographyP className="text-left" style={{gridColumn: "span 5 / span 1"}}>
                  {ability.ability_description}
                </TypographyP>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
