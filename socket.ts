"use client";

import { io } from "socket.io-client";

export const socket = io({
  autoConnect: false,
  auth: {
    room: "",
    name: ""
  }
});
