import { Socket } from "socket.io";

export interface Move {
  name: string
  description: string
  animation: string
}

export interface Character {
  blob: string
  moveset: Move[]
  hp: number
}

export interface PlayerState {
  ws: Socket,
  name: string,
  Character: Character | null,
  selected_move_idx: number,
}

export interface GameState {
  player_1: PlayerState | null,
  player_2: PlayerState | null,
  state: "waiting" | "drawing" | "fighting" | "end",
  round: number
}
