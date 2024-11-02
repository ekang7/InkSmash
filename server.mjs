import { createServer } from 'http';
import { parse } from 'url'
import next from 'next'

import { Server } from "socket.io";
import { handle_connection } from "./dist/game/main.js";

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    handle_connection(socket);
  });

  httpServer.listen(port)

  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`
  )
})
