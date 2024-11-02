import { callOpenAi } from "../openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data: {test: string}  = await req.json() as {test: string};

  const agenda_response_json = await callOpenAi({
    system_prompt: "",
    message_prompt: data.test,
    json_response: ""
  });

  if (agenda_response_json.error != null) {
    return NextResponse.json({
      message: null,
      error: {
        agenda: agenda_response_json.error,
      },
      status: 500
    });
  }

  return NextResponse.json({message: {
    agenda: JSON.parse(agenda_response_json.message),
  }, error: null, status: 200});
}
