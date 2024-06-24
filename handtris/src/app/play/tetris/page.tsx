// src/components/Home.tsx

"use client";
import { useEffect, useRef, useCallback } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { WebSocketManager } from "@/components/WebSocketManager";
import { TetrisGame } from "@/components/TetrisGame";
import { HandGestureManager } from "@/components/HandGestureManager";

const Home: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasTetrisRef = useRef<HTMLCanvasElement>(null);
  const canvasTetris2Ref = useRef<HTMLCanvasElement>(null);
  const gestureRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const tetrisGameRef = useRef<TetrisGame | null>(null);

  const onResults = useCallback((results: any) => {
    const canvasCtx = canvasRef.current!.getContext("2d")!;
    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height
    );
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height
    );

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 1,
        });
        drawLandmarks(canvasCtx, landmarks, {
          color: "#FF0000",
          lineWidth: 0.05,
        });

        const gesture = recognizeGesture(landmarks);
        if (gestureRef.current) {
          gestureRef.current.innerText = `Gesture: ${gesture}`;
        }

        handleHandPosition(landmarks);
      }
      if (borderRef.current) {
        borderRef.current.style.boxShadow = "none";
      }
    } else {
      if (gestureRef.current) {
        gestureRef.current.innerText = "Gesture: None";
      }
      if (borderRef.current) {
        borderRef.current.style.boxShadow = "0 0 20px 20px red";
      }
    }
    canvasCtx.restore();
  }, []);

  const recognizeGesture = (landmarks: any[]): string => {
    const thumbTip = landmarks[4];
    const indexFingerTip = landmarks[8];
    const middleFingerTip = landmarks[12];
    const ringFingerTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const palmBase = landmarks[0];

    const allFingersExtended =
      thumbTip.y < palmBase.y &&
      indexFingerTip.y < palmBase.y &&
      middleFingerTip.y < palmBase.y &&
      ringFingerTip.y < palmBase.y &&
      pinkyTip.y < palmBase.y;

    if (allFingersExtended) {
      return "Palm";
    } else if (
      indexFingerTip.x < thumbTip.x &&
      middleFingerTip.x < thumbTip.x
    ) {
      return "Pointing Right";
    } else if (
      indexFingerTip.x > thumbTip.x &&
      middleFingerTip.x > thumbTip.x
    ) {
      return "Pointing Left";
    }

    return "Unknown";
  };

  const handleHandPosition = (landmarks: any[]) => {
    const indexFingerTip = landmarks[8];
    const warningThreshold = 0.1;

    const deltaX = indexFingerTip.x - 0.5;
    const newBlockX = Math.floor((deltaX + 0.5) * tetrisGameRef.current!.COL);

    if (newBlockX >= 0 && newBlockX < tetrisGameRef.current!.COL) {
      tetrisGameRef.current!.p.moveTo(newBlockX);
    }

    if (
      indexFingerTip.x < warningThreshold ||
      indexFingerTip.x > 1 - warningThreshold
    ) {
      if (borderRef.current) {
        borderRef.current.style.boxShadow = "0 0 20px 20px yellow";
      }
    }
  };

  const startGame = () => {
    if (canvasTetrisRef.current && canvasTetris2Ref.current) {
      const ctx = canvasTetrisRef.current.getContext("2d")!;
      const ctx2 = canvasTetris2Ref.current.getContext("2d")!;
      wsManagerRef.current = new WebSocketManager(
        "https://api.checkmatejungle.shop/tetris",
        (message: any) => {
          console.log("Message received in Home: ", message);
          tetrisGameRef.current?.drawBoard2(message.board);
        }
      );
      tetrisGameRef.current = new TetrisGame(ctx, ctx2, wsManagerRef.current);
    }

    const handsManager = new HandGestureManager(onResults);
    handsManager.start(videoRef.current!);
  };

  useEffect(() => {
    // WebSocket and game initialization logic moved to startGame function
  }, [onResults]);

  return (
    <>
      <div className="grid-container">
        <div id="webcam-container">
          <div ref={gestureRef}>Gesture: None</div>
          <video
            ref={videoRef}
            id="video"
            width="320"
            height="240"
            autoPlay
            className="hidden"
          ></video>
          <canvas ref={canvasRef} id="canvas" width="320" height="240"></canvas>
        </div>
        <div id="webcam-container">
          <div id="tetris-container">
            <canvas
              ref={canvasTetrisRef}
              id="tetris"
              width="320"
              height="640"
            ></canvas>
            <div ref={borderRef} id="tetris-border"></div>
          </div>
        </div>
        <div id="webcam-container">
          <canvas
            ref={canvasTetris2Ref}
            id="tetrisCanvas2"
            width="320"
            height="640"
          ></canvas>
        </div>
        <div id="webcam-container">
          <div className=""> 상대방 웹캠 보일 디브 </div>
          <div id="remoteStreamDiv"> remote Stream Div</div>
          <button type="button" id="startSteamBtn" onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
