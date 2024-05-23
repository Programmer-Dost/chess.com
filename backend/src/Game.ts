import WebSocket from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./message";
export class Game {
  public board: Chess;
  public player1: WebSocket;
  public player2: WebSocket;
  private moveCount = 0;
  //   public moves: String[];
  private startTime: Date;
  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    // this.moves = [];
    this.startTime = new Date();
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
        },
      })
    );
  }
  move(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    console.log({ move });
    if (this.moveCount % 2 === 0 && socket !== this.player1) {
      console.log("Early return 1");
      return;
    }
    if (this.moveCount % 2 === 1 && socket !== this.player2) {
      console.log("Early return 2");
      return;
    }
    try {
      this.board.move(move);
    } catch (e) {
      console.error(e);
      return;
    }

    if (this.board.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      return;
    }
    if (this.moveCount % 2 === 0) {
      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
    this.moveCount++;
  }
}