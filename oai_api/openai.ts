/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

const API_CALLS_LOG = "./app/logs/api_calls.log";

export async function callOpenAi({
  system_prompt,
  message_prompt,
  json_response,
  model = "gpt-4o-mini",
  imageBlobs = [],
  imagePaths = [],
}: {
  system_prompt: string;
  message_prompt: string;
  json_response?: string;
  model?: string;
  imageBlobs?: string[];
  imagePaths?: string[];
}) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Encode the images to Base64
    imagePaths.forEach((imagePath) => {
      const imageBuffer = fs.readFileSync(path.resolve(imagePath));
      const base64Image = imageBuffer.toString("base64");
      imageBlobs.push(base64Image);
    });

    const request_message: { type: string; text?: string; image_url?: { url: string } }[] = [
      {
        type: "text",
        text: `${message_prompt}. Respond in JSON format as follows: ${json_response}`,
      },
    ];

    // Add the images to the message if provided
    imageBlobs.forEach((base64Image) => {
      request_message.push({
        type: "image_url",
        image_url: {
          url: "data:image/png;base64," + base64Image,
        },
      });
    });

    // Send request to OpenAI with text and image
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: system_prompt },
        // @ts-expect-error: ignore typing error
        { role: "user", content: request_message },
      ],
      model: model,
      max_tokens: 3000,
      temperature: 1,
    });

    // Log the API call
    fs.appendFileSync(API_CALLS_LOG, system_prompt + "\n" + JSON.stringify(request_message, null, 2) + "\n");
    fs.appendFileSync(API_CALLS_LOG, JSON.stringify(completion, null, 2) + "\n\n");

    if (!completion.choices[0]?.message?.content) {
      return { message: "No response from OpenAI", error: "No response from OpenAI", errorCode: 500 };
    }

    const cleaned = completion.choices[0].message.content.replace(/^```json\s*|\s*```$/g, '');

    return { message: cleaned, error: null, status: 200 };
  } catch (error: unknown) {
    console.error("Error details:", error); // Log the full error details
    const errorMessage = (error as { message: string }).message || "An unexpected error occurred";
    const errorCode: number = (error as { status: number }).status || 500;

    return { message: errorMessage, error, errorCode };
  }
}
