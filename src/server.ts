import "dotenv/config";
import http from "http";
import { Server as SocketServer } from "socket.io";
import app from "./app";
import { initSocket } from "./socket/socket.handler";
import redis from "./lib/redis";

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const startServer = async () => {
  try {
    await redis.connect();

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

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
