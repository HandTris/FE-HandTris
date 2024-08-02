import {
  ExtendedResults,
  SetLandmarksFunction,
} from "./../components/HandGestureManager";
import { HandGestureManager } from "@/components/HandGestureManager";
import { showCountdown } from "@/components/showCountdown";
import { TetrisGame } from "@/components/TetrisGame";
import { WebSocketManager } from "@/components/WebSocketManager";
import { TetrisBoard } from "@/types";
import { getRoomCode } from "@/util/getRoomCode";
import { MutableRefObject, RefObject } from "react";

type StartGameProps = {
  canvasTetrisRef: RefObject<HTMLCanvasElement>;
  canvasTetris2Ref: RefObject<HTMLCanvasElement>;
  setIsDangerous: (isDangerous: boolean) => void;
  setShowWaitingModal: (show: boolean) => void;
  setLeftHandLandmarks: SetLandmarksFunction;
  setRightHandLandmarks: SetLandmarksFunction;
  handleGesture: (gesture: string, handType: string) => void;
  onResults: (results: ExtendedResults) => void;
  videoRef: RefObject<HTMLVideoElement>;
  wsManagerRef: RefObject<WebSocketManager>;
  handsManagerRef: MutableRefObject<HandGestureManager | null>;
  tetrisGameRef: MutableRefObject<TetrisGame | null>;
  isSub: MutableRefObject<boolean>;
  setLinesCleared: (lines: number) => void;
  setGameResult: (result: string) => void;
  setIsFlipping: (isFlipping: boolean) => void;
  stopAllMusic: () => void;
  playSoundEffect: (sound: string) => void;
  toggleMusic: () => void;
};
export const startGame = async ({
  canvasTetrisRef,
  canvasTetris2Ref,
  setIsDangerous,
  setShowWaitingModal,
  setLeftHandLandmarks,
  setRightHandLandmarks,
  handleGesture,
  onResults,
  videoRef,
  wsManagerRef,
  handsManagerRef,
  tetrisGameRef,
  setLinesCleared,
  setGameResult,
  isSub,
  setIsFlipping,
  stopAllMusic,
  playSoundEffect,
  toggleMusic,
}: StartGameProps) => {
  if (canvasTetrisRef.current) {
    const ctx = canvasTetrisRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(
        0,
        0,
        canvasTetrisRef.current.width,
        canvasTetrisRef.current.height,
      );
    }
  }
  if (canvasTetris2Ref.current) {
    const ctx2 = canvasTetris2Ref.current.getContext("2d");
    if (ctx2) {
      ctx2.clearRect(
        0,
        0,
        canvasTetris2Ref.current.width,
        canvasTetris2Ref.current.height,
      );
    }
  }
  setIsDangerous(false);
  setShowWaitingModal(false);
  await new Promise(resolve => setTimeout(resolve, 800));
  const roomCode = getRoomCode();
  if (!handsManagerRef.current) {
    handsManagerRef.current = new HandGestureManager(
      setLeftHandLandmarks,
      setRightHandLandmarks,
      handleGesture,
      onResults,
    );
    handsManagerRef.current.start(videoRef.current!);
  }
  await showCountdown();
  if (canvasTetrisRef.current && canvasTetris2Ref.current) {
    const ctx = canvasTetrisRef.current.getContext("2d")!;
    const ctx2 = canvasTetris2Ref.current.getContext("2d")!;

    try {
      if (!isSub.current) {
        wsManagerRef.current?.subscribe(
          `/user/queue/tetris/${roomCode}`,
          (message: {
            board: TetrisBoard;
            isEnd: boolean;
            isAddAttack: boolean;
            isFlipAttack: boolean;
            isDonutAttack: boolean;
          }) => {
            if (tetrisGameRef.current) {
              if (message.isEnd) {
                tetrisGameRef.current.gameEnd = true;
                stopAllMusic();
                playSoundEffect("/sound/winner.mp3");
                setGameResult("you WIN!");
              }
              if (message.isAddAttack) {
                tetrisGameRef.current.isAddAttacked = true;
              } else if (message.isFlipAttack) {
                setIsFlipping(true);
                const playOppTetrisElement =
                  document.getElementById("tetris-container");
                if (
                  playOppTetrisElement &&
                  !playOppTetrisElement.classList.contains("flipped-canvas")
                ) {
                  playOppTetrisElement.classList.add("flipped-canvas");
                  setTimeout(() => {
                    setIsFlipping(false);
                    setTimeout(() => {
                      playOppTetrisElement.classList.add("unflipped-canvas");
                      setTimeout(() => {
                        playOppTetrisElement.classList.remove("flipped-canvas");
                        playOppTetrisElement.classList.remove(
                          "unflipped-canvas",
                        );
                      }, 500);
                    }, 100);
                  }, 2900);
                }
              } else if (message.isDonutAttack) {
                tetrisGameRef.current.isDonutAttacked = true;
              }
              tetrisGameRef.current.drawBoard2(message.board);
            }
          },
        );
        isSub.current = true;
      }

      tetrisGameRef.current = new TetrisGame(
        ctx,
        ctx2,
        wsManagerRef.current!,
        setGameResult,
      );
      setLinesCleared(tetrisGameRef.current.linesCleared);
      tetrisGameRef.current.roomCode = getRoomCode();
    } catch (error) {
      console.error("Failed to connect to WebSocket for game", error);
    }
  }
  toggleMusic();
};
