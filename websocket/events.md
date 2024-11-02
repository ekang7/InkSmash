# Websocket Events

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

`character_info(self, opp)`
- Server -> client.
- After AI Magic, server sends back character info.
  - Self: Player's character info.
  - Opp: Opponent's character info.
- Character info:
  - Blob: Image of character.
  - Moveset: List of moves
    - ID 
    - Name
    - Description (damage, accuracy, mana, etc.)
    - Associated animation gif
- Once client receives, transition into battle screen.

`select_move(move_id)`
- Client -> server.
- Sends client's move selection to the server.
- Server waits to receive both moves before calculating outcome.

`attack(move_id_1, move_id_2)`
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
