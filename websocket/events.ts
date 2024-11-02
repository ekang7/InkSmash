import { Socket } from "socket.io";
import { Character } from "@/game/types";

interface WebsocketEvent {
  type: string
  payload: unknown
}

interface StartGameEvent extends WebsocketEvent {
  type: "start_game",
  payload: undefined
}

interface StartRoundEvent extends WebsocketEvent {
  type: "start_round",
  payload: undefined
}

interface FinishDrawingEvent extends WebsocketEvent {
  type: "finish_drawing",
  payload: undefined
}

interface SubmitDrawingEvent extends WebsocketEvent {
  type: "submit_game",
  payload: {
    blob: string
  }
}

interface CharacterInfoEvent extends WebsocketEvent {
  type: "character_info",
  payload: {
    self: Character,
    opp: Character
  }
}

interface SelectMoveEvent extends WebsocketEvent {
  type: "select_move",
  payload: {
    move_id: string
  }
}

interface AttackEvent extends WebsocketEvent {
  type: "attack",
  payload: {
    self_move: string,
    opp_move: string
  }
}

interface EndRoundEvent extends WebsocketEvent {
  type: "end_round",
  payload: undefined
}

interface EndGameEvent extends WebsocketEvent {
  type: "end_game",
  payload: {
    won: boolean
  }
}

// Create a mapping of acceptable types -> payloads.
// This way, we can have more accurate type checking for
// send_event and receive_event.
type AllEvents = StartGameEvent | StartRoundEvent | FinishDrawingEvent | SubmitDrawingEvent | CharacterInfoEvent | SelectMoveEvent | AttackEvent | EndRoundEvent | EndGameEvent;
type EventTypes = AllEvents["type"];
type PayloadMap = {
  [E in AllEvents as E["type"]]: E["payload"];
}

export function send_event<T extends EventTypes>(
  socket: Socket,
  type: T,
  ...args: PayloadMap[T] extends undefined ? [] : [payload: PayloadMap[T]]
): void {
  socket.emit(type, args[0]);
}

export function on_event<T extends EventTypes>(
  socket: Socket,
  type: T,
  callback: (payload: PayloadMap[T]) => void
): void {
  // @ts-expect-error: Avoid complaint on callback type.
  socket.on(type, callback);
}
