"use client";
import React, { useEffect, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import { Button } from "../components/Button";
import { useSocket } from "../(hooks)/useSocket";
import { Chess } from "chess.js";
function Game() {
  const socket = useSocket();

  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());

  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!socket) {
      console.log("socket is not connected");
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case INIT_GAME:
          //   setChess(new Chess());
          setBoard(chess.board());
          setStarted(true);
          console.log("Game initialized");
          break;
        case MOVE:
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          console.log("Move made");
          break;
        case GAME_OVER:
          console.log("Game over");
          setStarted(false);
          break;
      }
    };
  }, [socket]);
  //
  const INIT_GAME = "init_game";
  const MOVE = "move";
  const GAME_OVER = "game_over";
  const JOIN_GAME = "join_game";
  const OPPONENT_DISCONNECTED = "opponent_disconnected";
  const JOIN_ROOM = "join_room";
  const GAME_NOT_FOUND = "game_not_found";
  const GAME_JOINED = "game_joined";
  const GAME_ENDED = "game_ended";
  const GAME_ALERT = "game_alert";
  const GAME_ADDED = "game_added";
  const GAME_TIME = "game_time";

  if (!socket) {
    return <div> Loading....</div>;
  }

  return (
    <div className="justify-center flex">
      <div className="pt-8 max-w-screen-lg w-full">
        <div className="grid grid-cols-6 gap-4 w-full   ">
          <div className="col-span-4 bg-slate-500 w-full justify-center flex">
            <ChessBoard
              chess={chess}
              setBoard={setBoard}
              socket={socket}
              board={board}
              started={started}
            />
          </div>

          <div className="col-span-2 bg-slate-300">
            <Button
              className="mt-10 text-black rounded-2xl p-4 bg-gray-400 w-full text-3xl flex gap-10 items-center justify-center opacity-85 transition hover:opacity-100"
              onClick={() => {
                socket.send(JSON.stringify({ type: INIT_GAME }));
                setStarted(true);
              }}
            >
              <img
                className="w-16 h-16"
                src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713650980/chess-solid-svgrepo-com_qbosf3.svg"
                alt="icon"
              />
              <p className="text-4xl bg-black text-white h-18 rounded-md w-full p-4">
                Play{" "}
              </p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
