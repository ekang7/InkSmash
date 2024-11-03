import { GameState, PlayerState } from "./types.js";
import { Socket } from "socket.io";
import { on_event, send_event } from "@/websocket/events";

export class GameManager {
  rooms: Map<string, GameState>

  constructor() {
    this.rooms = new Map<string, GameState>();
  }

  public _debug_print_rooms() {
    console.log(this.rooms);
  }

  public handle_connection(socket: Socket) {
    const room_code = socket.handshake.auth.room as string;
    console.log(`Received connection for room ${room_code}`);

    if(!this.rooms.has(room_code)) {
      console.log(`Room ${room_code} does not exist`);
      socket.disconnect();
      return;
    }

    const room = this.rooms.get(room_code)!;
    const player_data: PlayerState = {
      Character: null,
      ws: socket,
      name: socket.handshake.auth.name as string
    };
    // Add player to room
    if(room.player_1 === null) {
      room.player_1 = player_data;
      send_event(socket, "set_player_num", { player_num: 1 });
    } else if(room.player_2 === null) {
      room.player_2 = player_data;
      send_event(socket, "set_player_num", { player_num: 2 });
    } else {
      console.log(`Room ${room_code} is full`);
      socket.disconnect();
      return;
    }

    // Add event listener for start_game
    on_event(socket, "start_game", () => {
      if(room.state === "waiting") {
        this.start_game(room_code);
      } else {
        console.log(`Received start_game event while in state ${room.state}`);
      }
    });

    // Add event listener for disconnect
    on_event(socket, "disconnect", () => {
      room.state = "waiting";
      if(room.player_1?.ws === socket) room.player_1 = null;
      if(room.player_2?.ws === socket) room.player_2 = null;

      // Send room updates
      send_event(room.player_1?.ws, "room_update", {
        player_1: room.player_1?.name ?? null,
        player_2: room.player_2?.name ?? null
      });
      send_event(room.player_2?.ws, "room_update", {
        player_1: room.player_1?.name ?? null,
        player_2: room.player_2?.name ?? null
      });

      // Delete room if both players have left
      if(room.player_1 === null && room.player_2 === null) {
        this.rooms.delete(room_code);
      }
    });

    // Send room update to both players
    send_event(room.player_1?.ws, "room_update", {
      player_1: room.player_1?.name ?? null,
      player_2: room.player_2?.name ?? null
    });
    send_event(room.player_2?.ws, "room_update", {
      player_1: room.player_1?.name ?? null,
      player_2: room.player_2?.name ?? null
    });
  }

  public create_room(): string {
    let room_code = "";
    do {
      // Generate 6 character room code
      const c = () => String.fromCharCode(Math.floor(Math.random() * 26) + 65);
      room_code = `${c()}${c()}${c()}${c()}${c()}${c()}`;
    } while (this.rooms.has(room_code));

    this.rooms.set(room_code, {
      player_1: null,
      player_2: null,
      state: "waiting",
      round: 0
    });

    return room_code;
  }

  public verify_room(room_code: string): boolean {
    console.log(this.rooms);
    console.log(room_code);
    return this.rooms.has(room_code);
  }

  public is_room_full(room_code: string): boolean {
    return this.rooms.has(room_code)
      && this.rooms.get(room_code)!.player_1 !== null
      && this.rooms.get(room_code)!.player_2 !== null;
  }

  private start_game(room_code: string) {
    const room = this.rooms.get(room_code)!;
    room.state = "drawing";
    room.round = 0;
    send_event(room.player_1!.ws, "start_drawing");
    send_event(room.player_2!.ws, "start_drawing");
  }
}
