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

`start_round`
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

`character_info(player_1, player_2)`
- Server -> client.
- After AI Magic, server sends back character info.
- Character info:
  - Blob: Image of character.
  - Moveset: List of moves
    - Name
    - Description (damage, accuracy, mana, etc.)
    - Associated animation gif
- Once client receives, transition into battle screen.

`select_move(move_idx)`
- Client -> server.
- Sends client's move selection to the server.
- Server waits to receive both moves before calculating outcome.

`attack(player_1_move, player_2_move)`
- Server -> client.
- Sends both clients the chosen moves.

`end_round`
- Client -> server.
- Sent once both clients have played the animation and are on the battle end screen.
- Server waits to receive both before starting the next round.

`end_game(won)`
- Server -> client.
- Sent when someone has won the majority of rounds.
- Won: Boolean, true if client won, false if client lost.
