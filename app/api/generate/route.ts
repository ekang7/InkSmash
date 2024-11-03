import { NextResponse } from "next/server";
import { callOpenAi } from "@/oai_api/openai";

export async function POST(req: Request) {
  const data: { test: string } = await req.json() as { test: string };

  const agenda_response_json = await callOpenAi({
    system_prompt: "you are an expert pokemon rater",
    message_prompt: data.test,
    json_response: '{"moves": [{"move": "move name", "damage": 0}, {"move": "move name", "damage": 0}, {"move": "move name", "damage": 0}]}',
    imagePaths: ["./app/images/test.png"]
  });

  if (agenda_response_json.error != null) {
    return NextResponse.json({
      message: null,
      error: {
        agenda: agenda_response_json.error,
      },
      status: 500
      //TODO: remove this for security reasons so LLM calls can't get spammed
    }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  return NextResponse.json({
    message: { agenda: JSON.parse(agenda_response_json.message) },
    error: null,
    status: 200
    //TODO: remove this for security reasons so LLM calls can't get spammed
  }, { headers: { 'Access-Control-Allow-Origin': '*' } });
}
