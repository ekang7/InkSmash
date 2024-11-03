# Websocket Events

`set_player_num(player_num)`
- Server -> client.
- Sent when a player first connects to the server, assigns player number.

`room_update(player_1_name, player_2_name)`
- Server -> client.
- Sent when a player joins a room, or when a player leaves.
- Name can be null, indicating an empty slot.

`start_game`
- Client -> server.
- Starts game flow on server.

`start_drawing`
- Server -> client.
- Starts 30 second countdown on server.
- Clients start enabling drawing after receiving.

`finish_drawing`
- Server -> client.
- Clients stop drawing after receiving, exports canvas to server.

`submit_drawing(blob)`
- Client -> server.
- Canvas gets exported to PNG -> sent as blob.
- Server receives blob -> does ✨AI Magic!✨

`choose_moves(current, new)`
- Server -> client.
- Sent after AI Magic, server sends back move selection.
- Current: List of moves already chosen.
- New: most recent ability drawn.

`swap_move(move_idx)`
- Client -> server.
- Sends which move the client has selected to swap out.

`character_info(info, player_num)`
- Server -> client.
- Sent once a player has selected their move, and updated their info.
- Sent to both clients, and each client receives both info.
- Character info:
  - Blob: Image of character.
  - Moveset: List of moves
    - Name
    - Png: blob of move icon

`use_move(move_idx)`
- Client -> server.
- Sends client's move selection to the server.
- Server waits to receive both moves before calculating outcome.

`attack(player_1_move, player_2_move, outcome)`
- Server -> client.
- Sends both clients the chosen moves, and the AI generated outcome.

`continue_round`
- Client -> server.
- Sent once client has finished playing animations and is ready to continue.
- Server waits until both clients are ready before sending next round.

`end_game(winner)`
- Server -> client
- Sent if a player wins the game.
