import { GameState, PlayerState } from "./types.js";
import { Socket } from "socket.io";
import { on_event, send_event, single_event } from "@/websocket/events";

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
        this.start_character_drawing(room_code);
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

  private async start_character_drawing(room_code: string) {
    const room = this.rooms.get(room_code)!;
    room.state = "drawing";
    send_event(room.player_1!.ws, "start_drawing");
    send_event(room.player_2!.ws, "start_drawing");

    // Wait 30 seconds before finishing drawing
    await this.delay(30);

    send_event(room.player_1!.ws, "finish_drawing");
    send_event(room.player_2!.ws, "finish_drawing");

    // Store saved drawings from both players
    room.player_1!.Character!.img = (await single_event(room.player_1!.ws, "submit_drawing")).blob;
    room.player_2!.Character!.img = (await single_event(room.player_2!.ws, "submit_drawing")).blob;

    this.start_ability_drawing(room_code);
  }

  private async start_ability_drawing(room_code: string) {
    const room = this.rooms.get(room_code)!;
    send_event(room.player_1!.ws, "start_drawing");
    send_event(room.player_2!.ws, "start_drawing");

    // Wait 20 seconds before finishing drawing
    await this.delay(20);

    send_event(room.player_1!.ws, "finish_drawing");
    send_event(room.player_2!.ws, "finish_drawing");

    // Store saved drawings from both players
    const player_1_move = (await single_event(room.player_1!.ws, "submit_drawing")).blob;
    const player_2_move = (await single_event(room.player_2!.ws, "submit_drawing")).blob;

    this.start_ability_selection(room_code, player_1_move, player_2_move);
  }

  private async start_ability_selection(room_code: string, player_1_move_img: string, player_2_move_img: string) {
    const room = this.rooms.get(room_code)!;

    // TODO: Query ChatGPT to generate move names and descriptions
    const player_1_move = { name: "Punch", description: "A basic punch", img: player_1_move_img };
    const player_2_move = { name: "Punch", description: "A basic punch", img: player_2_move_img };

    // Send move options to players
    send_event(room.player_1!.ws, "choose_moves", {
      current: room.player_1!.Character!.moveset,
      new: player_1_move
    });
    send_event(room.player_2!.ws, "choose_moves", {
      current: room.player_2!.Character!.moveset,
      new: player_2_move
    });

    // Wait for players to select moves
    const update_char_info = async (player_num: number) => {
      const player = player_num === 1 ? room.player_1! : room.player_2!;

      // First wait for the player to select their move
      const swapped_idx = (await single_event(player.ws, "swap_move")).move_idx;
      player.Character!.moveset[swapped_idx] = player_num === 1 ? player_1_move : player_2_move;

      // Send updated character info to both players
      send_event(room.player_1!.ws, "character_info", {
        info: player.Character!,
        player_num: player_num
      });
      send_event(room.player_2!.ws, "character_info", {
        info: player.Character!,
        player_num: player_num
      });
    }

    // Wait for both players to select their moves
    await Promise.all([update_char_info(1), update_char_info(2)]);

    this.start_fight(room_code);
  }

  private async start_fight(room_code: string) {
    const room = this.rooms.get(room_code)!;
    room.state = "fighting";

    // Wait for both players to select their moves
    const player_1_move = (await single_event(room.player_1!.ws, "use_move")).move_idx;
    const player_2_move = (await single_event(room.player_2!.ws, "use_move")).move_idx;

    // TODO: Query AI to determine outcome
    const player_1_dmg = Math.random() * 10;
    const player_2_dmg = Math.random() * 10;
    const description =
      `${room.player_1!.name} used ${room.player_1!.Character!.moveset[player_1_move]!.name} and dealt ${player_1_dmg} damage.\n
        ${room.player_2!.name} used ${room.player_2!.Character!.moveset[player_2_move]!.name} and dealt ${player_2_dmg} damage.`;

    // Update player health
    room.player_1!.Character!.hp -= player_2_dmg;
    room.player_2!.Character!.hp -= player_1_dmg;

    // Send outcome to players
    send_event(room.player_1!.ws, "attack", {
      player_1_move: player_1_move,
      player_2_move: player_2_move,
      outcome: {
        player_1_new_health: room.player_1!.Character!.hp,
        player_2_new_health: room.player_2!.Character!.hp,
        description: description
      }
    });
    send_event(room.player_2!.ws, "attack", {
      player_1_move: player_1_move,
      player_2_move: player_2_move,
      outcome: {
        player_1_new_health: room.player_1!.Character!.hp,
        player_2_new_health: room.player_2!.Character!.hp,
        description: description
      }
    });

    // Wait until both clients have seen the outcome
    await single_event(room.player_1!.ws, "continue_round");
    await single_event(room.player_2!.ws, "continue_round");

    // Check if the game is over
    const hp1 = room.player_1!.Character!.hp;
    const hp2 = room.player_2!.Character!.hp;

    if(hp1 <= 0 && hp2 <= 0) {
      // Draw
      send_event(room.player_1!.ws, "end_game", { winner: 0 });
      send_event(room.player_2!.ws, "end_game", { winner: 0 });
    } else if(hp1 <= 0) {
      // Player 2 wins
      send_event(room.player_1!.ws, "end_game", { winner: 2 });
      send_event(room.player_2!.ws, "end_game", { winner: 2 });
    } else if(hp2 <= 0) {
      // Player 1 wins
      send_event(room.player_1!.ws, "end_game", { winner: 1 });
      send_event(room.player_2!.ws, "end_game", { winner: 1 });
    } else {
      // Continue the game
      this.start_ability_drawing(room_code);
    }
  }

  private delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
