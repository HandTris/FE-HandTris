"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { WebSocketManager } from "@/components/WebSocketManager";
import { TetrisGame } from "@/components/TetrisGame";
import { HandGestureManager } from "@/components/HandGestureManager";

const Home: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isAllReady, setIsAllReady] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasTetrisRef = useRef<HTMLCanvasElement>(null);
  const canvasTetris2Ref = useRef<HTMLCanvasElement>(null);
  const gestureRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const wsEnteringManagerRef = useRef<WebSocketManager | null>(null);
  const wsWaitingManagerRef = useRef<WebSocketManager | null>(null);
  const wsPlayManagerRef = useRef<WebSocketManager | null>(null);
  const tetrisGameRef = useRef<TetrisGame | null>(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      wsEnteringManagerRef.current = new WebSocketManager();
      try {
        await wsEnteringManagerRef.current.connect(
          "https://api.checkmatejungle.shop/ws",
          "/topic/owner",
          (message: any) => {
            console.log("대기방에서 받는 메시지: ", message);
            if (message.isOwner !== undefined) {
              setIsOwner((prevIsOwner) => {
                const newIsOwner = prevIsOwner === null ? message.isOwner : prevIsOwner;
                if (message.isOwner === false && prevIsOwner === true) {
                  setImageSrc("/image/guest_image.png");
                } else if (message.isOwner === false && prevIsOwner === null) {
                  setImageSrc("/image/host_image.webp");
                }
                return newIsOwner;
              });
            }
          }
        );

        wsEnteringManagerRef.current.sendMessageOnEntering({});
        setIsConnected(true);
      } catch (error) {
        console.error("Failed to connect to WebSocket", error);
      }
    };

    connectWebSocket();

    return () => {
      wsEnteringManagerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isOwner != null) {
      subscribeToState();
    }
  }, [isOwner]);

  const subscribeToState = async () => {
    console.log("subscribeToState 함수 앞", isAllReady);
    if (!wsWaitingManagerRef.current) {
      wsWaitingManagerRef.current = new WebSocketManager();
    }
    try {
      await wsWaitingManagerRef.current.connect(
        "https://api.checkmatejungle.shop/ws",
        "/topic/state",
        (message: any) => {
          console.log("대기 정보 message received: ", message);
          setIsAllReady(message.isReady);
          if (message.isStart) {
            setIsStart(true);
            startGame();
          }
          console.log("isAllReady 상태 업데이트: ", isAllReady);
        }
      );
      console.log("Subscribed to /topic/state");
    } catch (error) {
      console.error("Failed to subscribe to /topic/state", error);
    }
  };

  const handleReadyClick = async () => {
    try {
      await wsWaitingManagerRef.current?.sendMessageOnWaiting({
        isAllReady: true,
        isStart: false,
      });
      console.log("Message sent to /app/tetris/ready");
    } catch (error) {
      console.error("Failed to send message to /app/tetris/ready", error);
    }
  };

  const handleStartGameClick = async () => {
    try {
      await wsWaitingManagerRef.current?.sendMessageForStart({
        isAllReady: true,
        isStart: true,
      });
      console.log("Message sent to start the game");
    } catch (error) {
      console.error("Failed to send message to start the game", error);
    }
  };

  const startGame = async () => {
    if (canvasTetrisRef.current && canvasTetris2Ref.current) {
      const ctx = canvasTetrisRef.current.getContext("2d")!;
      const ctx2 = canvasTetris2Ref.current.getContext("2d")!;
      wsPlayManagerRef.current = new WebSocketManager();
      let hasAlertShown = false;
      try {
        await wsPlayManagerRef.current.connect(
          "https://api.checkmatejungle.shop/ws",
          "/user/queue/tetris",
          (message: any) => {
            tetrisGameRef.current?.drawBoard2(message.board);
            if (message.isEnd) {
              tetrisGameRef.current.gameEnd = true;
              alert("You WIN!");
              // tetrisGameRef.current.gameOver = true;
            }
          }
        );
        tetrisGameRef.current = new TetrisGame(
          ctx,
          ctx2,
          wsPlayManagerRef.current
        );
      } catch (error) {
        console.error("Failed to connect to WebSocket for game", error);
      }
    }

    const handsManager = new HandGestureManager(onResults);
    handsManager.start(videoRef.current!);
  };

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
          // gestureRef.current.innerText = `Gesture: ${gesture}`;
        }

        handleHandPosition(landmarks);
      }
      if (borderRef.current) {
        borderRef.current.style.boxShadow = "none";
      }
    } else {
      if (gestureRef.current) {
        // gestureRef.current.innerText = "Gesture: None";
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

    const deltaX = 0.5 - indexFingerTip.x;
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

  const handleClearButtonClick = async () => {
    try {
      const response = await fetch(
        "https://api.checkmatejungle.shop/user/clear",
        {
          method: "GET",
          headers: {},
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Server response: ", result);
    } catch (error) {
      console.error("Error during GET request: ", error);
    }
  };
  
  const handleReadyStartClick = () => {
    if (isOwner) {
      if (isAllReady) {
        handleStartGameClick();
      }
    } else {
      handleReadyClick();
    }
  };

  return (
    <>
      <div className="grid-container">
        <div id="webcam-container">
          <div ref={gestureRef}></div>
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
          <div id="counter">
            {imageSrc && <img src={imageSrc} alt="Counter Status" />}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-3">
        <div></div>
        <button
          type="button"
          // id="webcam-container"
          onClick={handleReadyStartClick}
          className={`${
            isStart
              ? 'hidden'
              : isOwner && !isAllReady
              ? 'bg-gray-600 text-darkgray cursor-not-allowed'
              : 'bg-gray-800 text-white border border-green-600 cursor-pointer hover:bg-gray-700 active:bg-gray-600'
          } p-6 m-4 w-full mx-auto border rounded-lg transition-transform transform hover:scale-105 hover:brightness-125 hover:shadow-xl`}
          disabled={isOwner && !isAllReady}
        >
          {isOwner
            ? isAllReady
             ? 'Game Start'
              :'Waiting for Ready'
              : 'Ready'}
        </button>
      </div>
      <button
        type="button"
        style={{ backgroundColor: "red", color: "white", opacity: 0}}
        onClick={handleClearButtonClick}
      >
        임시버튼(눌러서 set.clear()))
      </button>
    </>
  );
};

export default Home;
