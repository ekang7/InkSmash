/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { env } from "@/env.mjs";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

export async function callOpenAi({
  system_prompt = "you are an expert pokemon rater",
  message_prompt = "come up with moves and corresponding damage scores",
  json_response = '{"moves": [{"move": "move name", "damage": 0}, {"move": "move name", "damage": 0}, {"move": "move name", "damage": 0}]}',
  model = "gpt-4o-mini",
  imagePath, // New parameter to take image path
}: {
  system_prompt: string;
  message_prompt: string;
  json_response?: string;
  model?: string;
  imagePath?: string;
}) {
  try {
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    // Encode the image to Base64
    let base64Image = "";
    if (imagePath) {
      const imageBuffer = fs.readFileSync(path.resolve(imagePath));
      base64Image = imageBuffer.toString("base64");
    }

    const request_message = [
      {
        type: "text",
        text: message_prompt + "Respond in JSON format as follows: " + json_response,
      },
    ];

    // Add the image to the message if provided
    if (base64Image) {
      request_message.push({
        type: "image_url",
        image_url: {
          url: "data:image/png;base64," + base64Image,
        },
      });
    }

    // console.log(request_message)

    // Send request to OpenAI with text and image
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: request_message },
      ],
      model: model,
      max_tokens: 3000,
      temperature: 1,
    });

    if (!completion.choices[0]?.message?.content) {
      return { message: "No response from OpenAI", error: "No response from OpenAI", errorCode: 500 };
    }

    const cleaned = completion.choices[0].message.content.replace(/^```json\s*|\s*```$/g, '');
    // console.log(cleaned)

    return { message: cleaned, error: null, status: 200 };
  } catch (error: unknown) {
    console.error("Error details:", error); // Log the full error details
    const errorMessage = (error as { message: string }).message || "An unexpected error occurred";
    const errorCode: number = (error as { status: number }).status || 500;

    return { message: errorMessage, error, errorCode };
  }
}
