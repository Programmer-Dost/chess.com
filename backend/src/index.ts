import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
const cluster = require("node:cluster");
const http = require("node:http");
const numCPUs = require("node:os").availableParallelism();
const process = require("node:process");

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log("cpu nums", numCPUs);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker: any, code: any, signal: any) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  const wss = new WebSocketServer({ port: 8080 });
  console.log("Running");
  const gameManager = new GameManager();
  wss.on("connection", function connection(ws) {
    gameManager.addUser(ws);
    console.log("connected to websocket");
    ws.on("error", console.error);

    ws.on("message", function message(data) {
      console.log("received: %s", data);
    });
    ws.on("disconnect", () => gameManager.removeUser(ws));
    // ws.send("something");
  });

  console.log(`Worker ${process.pid} started`);
}
