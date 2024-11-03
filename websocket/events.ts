import { Socket } from "socket.io";
import { Character } from "@/game/types";

interface WebsocketEvent {
  type: string;
  payload: unknown;
}

interface DisconnectEvent extends WebsocketEvent {
  type: "disconnect";
  payload: undefined;
}

interface ConnectErrorEvent extends WebsocketEvent {
  type: "connect_error";
  payload: Error;
}

interface SetPlayerNumEvent extends WebsocketEvent {
  type: "set_player_num";
  payload: {
    player_num: number;
  };
}

interface RoomUpdateEvent extends WebsocketEvent {
  type: "room_update";
  payload: {
    player_1: string | null;
    player_2: string | null;
  };
}

interface StartGameEvent extends WebsocketEvent {
  type: "start_game";
  payload: undefined;
}

interface StartRoundEvent extends WebsocketEvent {
  type: "start_round";
  payload: undefined;
}

interface FinishDrawingEvent extends WebsocketEvent {
  type: "finish_drawing";
  payload: undefined;
}

interface SubmitDrawingEvent extends WebsocketEvent {
  type: "submit_game";
  payload: {
    blob: string;
  };
}

interface CharacterInfoEvent extends WebsocketEvent {
  type: "character_info";
  payload: {
    player_1: Character;
    player_2: Character;
  };
}

interface SelectMoveEvent extends WebsocketEvent {
  type: "select_move";
  payload: {
    move_idx: number;
  };
}

interface AttackEvent extends WebsocketEvent {
  type: "attack";
  payload: {
    player_1_move: string;
    player_2_move: string;
  };
}

interface EndRoundEvent extends WebsocketEvent {
  type: "end_round";
  payload: undefined;
}

interface EndGameEvent extends WebsocketEvent {
  type: "end_game";
  payload: {
    won: boolean;
  };
}

// Create a mapping of acceptable types -> payloads.
// This way, we can have more accurate type checking for
// send_event and receive_event.
type AllEvents =
  | DisconnectEvent
  | ConnectErrorEvent
  | SetPlayerNumEvent
  | RoomUpdateEvent
  | StartGameEvent
  | StartRoundEvent
  | FinishDrawingEvent
  | SubmitDrawingEvent
  | CharacterInfoEvent
  | SelectMoveEvent
  | AttackEvent
  | EndRoundEvent
  | EndGameEvent;
type EventTypes = AllEvents["type"];
type PayloadMap = {
  [E in AllEvents as E["type"]]: E["payload"];
};

export function send_event<T extends EventTypes>(
  socket: Socket | undefined,
  type: T,
  ...args: PayloadMap[T] extends undefined ? [] : [payload: PayloadMap[T]]
): void {
  if(socket === undefined) return;
  socket.emit(type, args[0]);
}

export function on_event<T extends EventTypes>(
  socket: Socket | undefined,
  type: T,
  callback: (payload: PayloadMap[T]) => void,
): void {
  if (socket === undefined) return;
  // @ts-expect-error: Avoid complaint on callback type.
  socket.on(type, callback);
}
