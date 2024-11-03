import { Character, GameState, Move, PlayerState } from "./types.js";
import { Socket } from "socket.io";
import { on_event, send_event, single_event } from "@/websocket/events";
import { callOpenAi } from "@/oai_api/openai";
import * as ability_prompts from "@/oai_api/ability_prompts";
import * as fight_prompts from "@/oai_api/fight_prompts";
import * as character_prompts from "@/oai_api/character_prompts";

export class GameManager {
  rooms: Map<string, GameState>

  constructor() {
    this.rooms = new Map<string, GameState>();
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
      this.start_character_drawing(room_code);
    });

    // Add event listener for disconnect
    on_event(socket, "disconnect", () => {
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
      round: 0,
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
    room.round = 0;
    send_event(room.player_1!.ws, "start_drawing");
    send_event(room.player_2!.ws, "start_drawing");

    // Wait 30 seconds before finishing drawing
    for(let i = 30; i > 0; i--) {
      send_event(room.player_1!.ws, "timer_drawing", {time: i});
      send_event(room.player_2!.ws, "timer_drawing", {time: i});
      await this.delay(1000);
    }
    send_event(room.player_1!.ws, "timer_drawing", {time: 0});
    send_event(room.player_2!.ws, "timer_drawing", {time: 0});

    send_event(room.player_1!.ws, "finish_drawing");
    send_event(room.player_2!.ws, "finish_drawing");

    // Store saved drawings from both players
    const [player_1_img, player_2_img] = await Promise.all([
      single_event(room.player_1!.ws, "submit_drawing"),
      single_event(room.player_2!.ws, "submit_drawing")
    ]);

    // Generate names, stats, and descriptions for each character
    const generate_char_info = async (img: string): Promise<Character> => {
      const gpt = await callOpenAi({
        system_prompt: character_prompts.SYSTEM_PROMPT,
        message_prompt: character_prompts.MESSAGE_PROMPT,
        json_response: character_prompts.JSON_FORMAT,
        imageBlobs: [img]
      });
      if(gpt.status !== 200) {
        console.error("Failed to generate character for player");
        console.error(gpt);
        return {name: "??", description: "??", max_hp: 100, hp: 100, def: 10, str: 10, img: img, moveset: []};
      }

      const m = JSON.parse(gpt.message);
      return { name: m.name, description: m.description, max_hp: m.hp, hp: m.hp, def: m.def, str: m.str, img: img, moveset: []};
    }

    const show_character_info = async (player_num: number) => {
      const player = player_num === 1 ? room.player_1! : room.player_2!;
      const img = player_num === 1 ? player_1_img : player_2_img;

      player.Character = await generate_char_info(img.blob);
      send_event(player.ws, "character_info", {info: player.Character, player_num});
    }

    // Generate and show character info for both players
    await Promise.all([show_character_info(1), show_character_info(2)]);

    // Wait until both clients have seen the character info
    await Promise.all([
      single_event(room.player_1!.ws, "continue_round"),
      single_event(room.player_2!.ws, "continue_round")
    ]);

    this.start_ability_drawing(room_code);
  }

  private async start_ability_drawing(room_code: string) {
    const room = this.rooms.get(room_code)!;
    room.round += 1;
    send_event(room.player_1!.ws, "start_drawing");
    send_event(room.player_2!.ws, "start_drawing");

    // Wait 20 seconds before finishing drawing
    // Wait 30 seconds before finishing drawing
    for(let i = 20; i > 0; i--) {
      send_event(room.player_1!.ws, "timer_drawing", {time: i});
      send_event(room.player_2!.ws, "timer_drawing", {time: i});
      await this.delay(1000);
    }
    send_event(room.player_1!.ws, "timer_drawing", {time: 0});
    send_event(room.player_2!.ws, "timer_drawing", {time: 0});

    send_event(room.player_1!.ws, "finish_drawing");
    send_event(room.player_2!.ws, "finish_drawing");

    // Store saved drawings from both players
    const [player_1_move, player_2_move] = await Promise.all([
      single_event(room.player_1!.ws, "submit_drawing"),
      single_event(room.player_2!.ws, "submit_drawing")
    ]);

    this.start_ability_selection(room_code, player_1_move.blob, player_2_move.blob);
  }

  private async start_ability_selection(room_code: string, player_1_move_img: string, player_2_move_img: string) {
    const room = this.rooms.get(room_code)!;

    const generate_ability_info = async (img: string): Promise<Move> => {
      const gpt = await callOpenAi({
        system_prompt: ability_prompts.SYSTEM_PROMPT,
        message_prompt: ability_prompts.MESSAGE_PROMPT,
        json_response: ability_prompts.JSON_FORMAT,
        imageBlobs: [img]
      });
      if(gpt.status !== 200) {
        console.error("Failed to generate move for player 1");
        return {name: "??", description: "??", img: img};
      }

      const message = JSON.parse(gpt.message);
      return { name: message.name, description: message.description, img: img};
    }

    const player_1_move = await generate_ability_info(player_1_move_img);
    const player_2_move = await generate_ability_info(player_2_move_img);

    // Check if players already have moves
    if(room.round <= 2) {
      room.player_1!.Character!.moveset.push(player_1_move);
      send_event(room.player_1!.ws, "character_info", {
        info: room.player_1!.Character!,
        player_num: 1
      });
      send_event(room.player_2!.ws, "character_info", {
        info: room.player_1!.Character!,
        player_num: 1
      });

      room.player_2!.Character!.moveset.push(player_2_move);
      send_event(room.player_1!.ws, "character_info", {
        info: room.player_2!.Character!,
        player_num: 2
      });
      send_event(room.player_2!.ws, "character_info", {
        info: room.player_2!.Character!,
        player_num: 2
      });

      this.start_fight(room_code);
      return;
    }

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

    // Wait for both players to select their moves
    const [player_1_move, player_2_move] = await Promise.all([
      single_event(room.player_1!.ws, "use_move"),
      single_event(room.player_2!.ws, "use_move")
    ]);

    // Query AI to determine outcome
    const gpt = await callOpenAi({
      system_prompt: fight_prompts.SYSTEM_PROMPT,
      message_prompt: fight_prompts.MESSAGE_PROMPT,
      json_response: fight_prompts.JSON_FORMAT,
      imageBlobs: [
        room.player_1!.Character!.img,
        room.player_2!.Character!.img,
        room.player_1!.Character!.moveset[player_1_move.move_idx]!.img,
        room.player_2!.Character!.moveset[player_2_move.move_idx]!.img,
      ]
    });

    // Default values
    let player_1_dmg = 0;
    let player_2_dmg = 0;
    let description =
      `${room.player_1!.name} used ${room.player_1!.Character!.moveset[player_1_move.move_idx]!.name} and dealt ${player_1_dmg} damage.\n
        ${room.player_2!.name} used ${room.player_2!.Character!.moveset[player_2_move.move_idx]!.name} and dealt ${player_2_dmg} damage.`;

    if(gpt.status === 200) {
      const message = JSON.parse(gpt.message);
      player_1_dmg = message.player_1_dmg;
      player_2_dmg = message.player_2_dmg;
      description += '\n' + message.description;
    }

    room.player_1!.Character!.hp -= player_2_dmg;
    room.player_2!.Character!.hp -= player_1_dmg;

    // Send outcome to players
    send_event(room.player_1!.ws, "attack", {
      player_1_move: player_1_move.move_idx,
      player_2_move: player_2_move.move_idx,
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
    await Promise.all([
      single_event(room.player_1!.ws, "continue_round"),
      single_event(room.player_2!.ws, "continue_round")
    ]);

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
