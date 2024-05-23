"use client";
import { Color, PieceSymbol, Square } from "chess.js";
import React, { useEffect, useState } from "react";

function ChessBoard({
  board,
  socket,
  setBoard,
  chess,
  started,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  setBoard: any;
  chess: any;
  started: boolean;
}) {
  interface leadboard {
    before: string;
    after: string;
    color: string;
    piece: string;
    from: string;
    to: string;
    san: string;
    lan: string;
    flags: string;
    captured?: string;
  }
  const [from, setFrom] = useState<null | Square>(null);
  const [leadboard, setLeadboard] = useState<leadboard[]>([]);

  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
  useEffect(() => {
    let timer: any;
    if (started) {
      console.log("game started");
      timer = setInterval(() => {
        if (chess.turn() === "w") {
          setPlayer1TimeConsumed((p) => {
            if (p === 6000 * 100) {
              console.log("time up");
              clearInterval(timer);
              return 0;
            }
            return p + 100;
          });
        } else {
          setPlayer2TimeConsumed((p) => {
            if (p === 6000 * 100) {
              console.log("time up");
              clearInterval(timer);
              return 0;
            }
            return p + 100;
          });
        }
      }, 100);
      // return clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [started]);

  let turnStartTime: number;
  let timeLimit = 10 * 60 * 1000; // 10 mins seconds

  useEffect(() => {
    if (
      player1TimeConsumed === 6000 * 100 ||
      player2TimeConsumed === 6000 * 100
    ) {
      let winner;
      if (chess.turn() === "w" && player1TimeConsumed === 6000 * 100) {
        console.log("player1 time consumed");
        winner = "Black";
      } else if (chess.turn() === "b" && player2TimeConsumed === 6000 * 100) {
        console.log("player2 time consumed");
        winner = "White";
      }
      alert(`${winner} wins!`);

      console.log(`${winner} wins!`);
    }
  }, [player1TimeConsumed, player2TimeConsumed]);
  const getTimer = (timeConsumed: number) => {
    const timeLeftMs = timeLimit - timeConsumed;
    const minutes = Math.floor(timeLeftMs / (1000 * 60));
    const remainingSeconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    return (
      <div className="text-white">
        Time Left: {minutes < 10 ? "0" : ""}
        {minutes}:{remainingSeconds < 10 ? "0" : ""}
        {remainingSeconds === 6 ? "0" : remainingSeconds}
      </div>
    );
  };

  function isPawnPromotion(from: string, to: string) {
    const pawn = chess.get(from);
    console.log({ pawn });
    if (pawn?.type !== "p") {
      console.log("not pawn", to);

      return false;
    }
    console.log(
      pawn &&
        pawn.type === "p" &&
        ((pawn.color === "w" && to === "h8") ||
          (pawn.color === "b" && to === "a0")),
      to
    );
    return (
      pawn &&
      pawn.type === "p" &&
      ((pawn.color === "w" && to.charAt(1) === "8") ||
        (pawn.color === "b" && to.charAt(1) === "1"))
    );
  }
  return (
    <div>
      {board.map((rows, i) => {
        // console.log({rows}, "row", i)
        return (
          <div key={i} className="flex md:w-full">
            {rows.map((square, j) => {
              const squareRepresentation = (String.fromCharCode(97 + (j % 8)) +
                "" +
                (8 - i)) as Square;
              return (
                <div
                  key={j}
                  className={`w-16 h-16 ${
                    (i + j) % 2 === 0 ? "bg-slate-900" : "bg-white"
                  }`}
                  onClick={() => {
                    if (!from) {
                      setFrom(squareRepresentation);
                    } else {
                      socket.send(
                        JSON.stringify({
                          type: "move",
                          payload: {
                            move: {
                              from,
                              to: squareRepresentation,
                            },
                          },
                        })
                      );
                      setFrom(null);
                      try {
                        if (chess.isGameOver()) {
                          // Check for checkmate or stalemate
                          const winner = chess.isStalemate()
                            ? "Draw"
                            : chess.turn() === "w"
                            ? "Black"
                            : "White";
                          alert(`${winner} wins!`);
                          console.log(`${winner} wins!`);
                          return true;
                        }
                        console.log({ squareRepresentation });

                        if (isPawnPromotion(from, squareRepresentation)) {
                            console.log("pawn promoting")
                          let moveResult = chess.move({
                            from,
                            to: squareRepresentation,
                            promotion: "q",
                          });
                          console.log({ moveResult });
                        } else {
                          chess.move({
                            from,
                            to: squareRepresentation,
                          });
                        }
                        let move = chess.move({
                          from,
                          to: squareRepresentation,
                        });

                        console.log(move);
                        if (move.captured) {
                          setLeadboard((prev) => [...prev, move]);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                      setBoard(chess.board());
                      console.log(from, squareRepresentation);
                    }
                  }}
                >
                  <div className="w-full justify-center flex text-black h-full">
                    <div className="h-full justify-center flex flex-col">
                      {/* {square?.type ?? ""} */}
                      {square ? (
                        <img
                          className="w-5"
                          src={`/${
                            square?.color === "b"
                              ? `b${square?.type}`
                              : `w${square?.type}`
                          }.png`}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      Hi
      <span>
        <p className="flex">{getTimer(player1TimeConsumed)}: Player 1 White</p>
        <p className="flex">{getTimer(player2TimeConsumed)}: Player 2 Black</p>
      </span>
      <div className="flex">
        {leadboard.map((piece) =>
          piece.captured ? (
            <img
              className="w-5"
              src={`/${
                piece?.color === "w"
                  ? `b${piece?.captured}`
                  : `w${piece?.captured}`
              }.png`}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

export default ChessBoard;
