import { Socket } from "socket.io";
import { AttackOutcome, Character, Move } from "@/game/types";

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

interface StartDrawingEvent extends WebsocketEvent {
  type: "start_drawing";
  payload: undefined;
}

interface TimerDrawingEvent extends WebsocketEvent {
  type: "timer_drawing";
  payload: {
    time: number;
  };
}

interface FinishDrawingEvent extends WebsocketEvent {
  type: "finish_drawing";
  payload: undefined;
}

interface SubmitDrawingEvent extends WebsocketEvent {
  type: "submit_drawing";
  payload: {
    blob: string;
  };
}

interface ChooseMovesEvent extends WebsocketEvent {
  type: "choose_moves";
  payload: {
    current: Move[];
    new: Move;
  }
}

interface SwapMoveEvent extends WebsocketEvent {
  type: "swap_move";
  payload: {
    move_idx: number
  }
}

interface CharacterInfoEvent extends WebsocketEvent {
  type: "character_info";
  payload: {
    info: Character;
    player_num: number;
  };
}

interface UseMoveEvent extends WebsocketEvent {
  type: "use_move";
  payload: {
    move_idx: number;
  }
}

interface AttackEvent extends WebsocketEvent {
  type: "attack";
  payload: {
    player_1_move: number;
    player_2_move: number;
    outcome: AttackOutcome;
  };
}

interface ContinueRoundEvent extends WebsocketEvent {
  type: "continue_round";
  payload: undefined;
}

interface EndGameEvent extends WebsocketEvent {
  type: "end_game";
  payload: {
    winner: number;
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
  | StartDrawingEvent
  | TimerDrawingEvent
  | FinishDrawingEvent
  | SubmitDrawingEvent
  | ChooseMovesEvent
  | SwapMoveEvent
  | CharacterInfoEvent
  | UseMoveEvent
  | AttackEvent
  | ContinueRoundEvent
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
  console.log("Sent event", type, args[0]);
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

export async function single_event <T extends EventTypes>(
  socket: Socket | undefined,
  type: T,
): Promise<PayloadMap[T]> {
  return new Promise((resolve) => {
    if (socket === undefined) return;
    console.log("Waiting for single event", type);
    // @ts-expect-error: Avoid complaint on callback type.
    socket.once(type, resolve);
  });
}
