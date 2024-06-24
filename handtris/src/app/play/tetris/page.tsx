"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { WebSocketManager } from "@/components/WebSocketManager";
import { TetrisGame } from "@/components/TetrisGame";
import { HandGestureManager } from "@/components/HandGestureManager";
import Image from "next/image";

const Home: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasTetrisRef = useRef<HTMLCanvasElement>(null);
  const canvasTetris2Ref = useRef<HTMLCanvasElement>(null);
  const gestureRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const tetrisGameRef = useRef<TetrisGame | null>(null);

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [roomId, setRoomId] = useState("example-room-id");
  const [username, setUsername] = useState("example-username");
  const [opponent, setOpponent] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

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
        "https://api.checkmatejungle.shop/ws",
        (message: any) => {
          console.log("Message received in Home: ", message);
          tetrisGameRef.current?.drawBoard2(message.board);

          if (message.type === "JOIN") {
            setOpponent(message.username);
          } else if (message.type === "READY") {
            if (message.username !== username) {
              setOpponentReady(true);
            }
          } else if (message.type === "START") {
            setIsGameStarted(true);
          }
        }
      );
      tetrisGameRef.current = new TetrisGame(ctx, ctx2, wsManagerRef.current);
    }

    const handsManager = new HandGestureManager(onResults);
    handsManager.start(videoRef.current!);
  };

  const handleReady = () => {
    setReady(true);
    wsManagerRef.current!.ready(roomId, username);
  };

  const handleStartGame = () => {
    wsManagerRef.current!.startGame(roomId);
  };

  return (
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
        {!isGameStarted && (
          <div className="waiting-room">
            <h2 className="text-2xl font-bold text-green-400 mb-4">대기실</h2>
            <div className="flex items-center w-full mb-4">
              <Image
                src="/image/profile-pic.jpeg"
                alt="Profile"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h2 className="text-xl font-bold text-green-400">{username}</h2>
                <p className="text-green-300">방장</p>
              </div>
            </div>
            <p className="text-lg text-green-300 mb-4">
              {opponent
                ? `${opponent}님이 참가했습니다!`
                : "상대방을 기다리는 중..."}
            </p>
            <div className="flex justify-between w-full">
              <div className="flex flex-col items-center">
                <p className="text-green-300">나</p>
                <p
                  className={`text-lg font-medium ${
                    ready ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {ready ? "READY" : "WAITING"}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-green-300">상대방</p>
                <p
                  className={`text-lg font-medium ${
                    opponentReady ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {opponentReady ? "READY" : "WAITING"}
                </p>
              </div>
            </div>
            <button
              onClick={handleReady}
              className={`bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 mt-4 ${
                ready ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={ready}
            >
              레디
            </button>
            {opponentReady && (
              <button
                onClick={handleStartGame}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 mt-4"
              >
                게임 시작
              </button>
            )}
          </div>
        )}
        <button type="button" id="startSteamBtn" onClick={startGame}>
          Start Game
        </button>
      </div>
    </div>
  );
};

export default Home;
