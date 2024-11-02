import { Socket } from "socket.io";

export interface Move {
  id: string
  name: string
  description: string
  animation: string
}

export interface Character {
  blob: string
  moveset: Move[]
}

export interface PlayerState {
  Character: Character,
  hp: number,
  selected_move_id: string,
  ws: Socket
}

export interface GameState {
  player_1: PlayerState,
  player_2: PlayerState,
}
