import { createServer } from 'http';
import { parse } from 'url'
import next from 'next'

import { Server } from "socket.io";
import { GameManager } from "./dist/game/main.js";

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const game_manager = new GameManager();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)

    // Next.js thinks serverless is the magical next thing everyone should use,
    // which means global state is not guaranteed to stay between routes.
    // This is a problem for the game manager, which needs to keep track of all
    // the rooms and their states. So, we're just going to handle any routes
    // that depend on game_manager here.

    // console.log(parsedUrl, parsedUrl.query);
    if(parsedUrl.pathname === "/api/create_room") {
      const room_code = game_manager.create_room();
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end(room_code);
      return;
    }
    if(parsedUrl.pathname === "/api/verify_code") {
      const code = parsedUrl.query.code;
      if(game_manager.verify_room(code)) {
        res.statusCode = 200;
        res.end("true");
      } else {
        res.statusCode = 200;
        res.end("false");
      }
      return
    }
    if(parsedUrl.pathname === "/api/is_room_full") {
      const code = parsedUrl.query.code;
      if(game_manager.is_room_full(code)) {
        res.statusCode = 200;
        res.end("true");
      } else {
        res.statusCode = 200;
        res.end("false");
      }
      return
    }

    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer);

  // Middleware to check if the user is connecting to a valid room code
  io.use((socket, next) => {
    console.log("Verifying", socket.handshake.auth.room);
    if(!game_manager.verify_room(socket.handshake.auth.room)) {
      console.log("Invalid room")
      next(new Error("Invalid room code"));
    }
    if(game_manager.is_room_full(socket.handshake.auth.room)) {
      console.log("Room is full")
      next(new Error("Room is full"));
    }
    console.log("Valid code")
    next();
  })

  io.on("connection", (socket) => {
    game_manager.handle_connection(socket);
  });

  httpServer.listen(port)

  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`
  )
})
