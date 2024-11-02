"use client"; // This line marks the component as a Client Component

import { useEffect, useState } from 'react';
import { TypographyH2, TypographyP } from "@/components/ui/typography";
import Canvas from "@/components/ui/canvas";

export default function Home() {
  const [json, setJson] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript: "Your transcript here", // Replace with actual data
            todoList: JSON.stringify(["item1", "item2"]), // Replace with actual data
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const result = await response.json();
        setJson(result); 
      } catch (error) {
        setError(error.message); 
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Canvas />

      <TypographyH2>Welcome to the T4SG starter project!</TypographyH2>
      <TypographyP>
        This starter project is styled with Tailwind CSS and uses shadcn/ui as a component library. Feel free to add
        your own components!
      </TypographyP>
      <TypographyP>
        This page is an unprotected route accessible to anyone who visits the website. Log in to view authenticated
        routes!
      </TypographyP>
      {json && (
        <TypographyP>
          <strong>API Response:</strong> {JSON.stringify(json)}
        </TypographyP>
      )}
      {error && (
        <TypographyP style={{ color: 'red' }}>
          <strong>Error:</strong> {error}
        </TypographyP>
      )}
    </>
  );
}
