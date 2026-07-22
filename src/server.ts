import "dotenv/config";
import http from "http";
import { Server as SocketServer } from "socket.io";

import redis from "./lib/redis";

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const startServer = async () => {
  await redis.connect();

  const { default: app } = await import("./app");
  const { initSocket } = await import("./socket/socket.handler");

  const server = http.createServer(app);

  const io = new SocketServer(server, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
    },
  });

  initSocket(io);

  server.listen(PORT, () => {
    console.log(`GharBhada API running on http://localhost:${PORT}`);
  });
};

startServer();
