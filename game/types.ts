import { Socket } from "socket.io";

export interface Move {
  name: string
  description: string
  img: string
}

export interface Character {
  img: string
  name: string
  description: string
  max_hp: number
  hp: number
  def: number
  str: number
  moveset: Move[]
}

export interface PlayerState {
  ws: Socket
  name: string
  Character: Character | null
}

export interface GameState {
  player_1: PlayerState | null,
  player_2: PlayerState | null,
  round: number,
}

export interface AttackOutcome {
  player_1_new_health: number,
  player_2_new_health: number,
  description: string
}
