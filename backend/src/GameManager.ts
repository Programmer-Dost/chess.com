import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./message";
import { Game } from "./Game";

export class GameManager {
  private games: Game[];
  private pendingGameId: string | null;
  private pendingUser: WebSocket | null;
  private users: WebSocket[];
  constructor() {
    this.games = [];
    this.pendingGameId = null;
    this.pendingUser = null;
    this.users = [];
  }
  addUser(user: WebSocket) {
    this.users.push(user);
    this.addHandler(user);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
    // const user = this.users.find((user) => user.socket !== socket);
    // if (!user) {
    //   console.error('User not found?');
    //   return;
    // }
    // this.users = this.users.filter((user) => user.socket !== socket);
    // SocketManager.getInstance().removeUser(user);
  }

  removeGame(gameId: string) {
    // this.games = this.games.filter((g) => g.gameId !== gameId);
   
  }
  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
            console.log("Reached pending")
          const game = new Game(this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser = null;
        } else {
            console.log("added to pending")
          this.pendingUser =socket;
        }
      }
      if(message.type === MOVE){
        const game = this.games.find(game=>game.player1 ===socket || game.player2 ===socket)
        if(game){
            game.move(socket, message.payload.move)
        }
      }
    });
  }
  private handleMessage() {}
}
