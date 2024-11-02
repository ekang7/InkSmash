import { GameState } from "./types.js";
import { Socket } from "socket.io";
import { on_event, send_event } from "@/websocket/events";

const rooms = new Map<string, GameState>();

export function handle_connection(socket: Socket) {
  console.log(socket.handshake.auth);
  send_event(socket, "start_game");
}
