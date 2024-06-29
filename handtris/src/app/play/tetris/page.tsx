"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { WebSocketManager } from "@/components/WebSocketManager";
import { TetrisGame } from "@/components/TetrisGame";
import { HandGestureManager } from "@/components/HandGestureManager";
import {
  playBackgroundMusic,
  stopBackgroundMusic,
} from "@/util/playBackgroundMusic";
import { isFingerStraight, isHandOpen } from "@/util/handLogic";
import Image from "next/image";
import { playSound } from "@/util/playSound";
import ThreeScene from "@/components/ThreeScene";
import { NAME_LABEL, NameLabel } from "@/styles";

const Home: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isAllReady, setIsAllReady] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState([]);
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastMoveTime = useRef({ right: 0, left: 0, rotate: 0 });
  const feedbackTimeoutRef = useRef<number | null>(null);

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
                const newIsOwner =
                  prevIsOwner === null ? message.isOwner : prevIsOwner;
                if (message.isOwner === false && prevIsOwner === true) {
                  setImageSrc("/image/guest_image.png");
                } else if (message.isOwner === false && prevIsOwner === null) {
                  setImageSrc("/image/guest_image2.png");
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
            startGame(); // 클라이언트 시작 로직
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
      try {
        await wsPlayManagerRef.current.connect(
          "https://api.checkmatejungle.shop/ws",
          "/user/queue/tetris",
          (message: any) => {
            tetrisGameRef.current?.drawBoard2(message.board);
            if (message.isEnd) {
              tetrisGameRef.current.gameEnd = true;
              stopBackgroundMusic(audioRef.current!);
              playSound("/sounds/winner.wav");
              setGameResult("you WIN!");
            }
          }
        );
        tetrisGameRef.current = new TetrisGame(
          ctx,
          ctx2,
          wsPlayManagerRef.current,
          setGameResult
        );
      } catch (error) {
        console.error("Failed to connect to WebSocket for game", error);
      }
    }

    const handsManager = new HandGestureManager(onResults);
    handsManager.start(videoRef.current!);

    const audio = playBackgroundMusic();
    audioRef.current = audio;
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

        handleGesture(gesture); // 제스처에 따라 블록 이동 처리
      }
      setLandmarks(results.multiHandLandmarks); // landmarks 업데이트
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

  const handleGesture = (gesture: string) => {
    const now = Date.now();

    if (gesture === "Palm") {
      if (now - lastMoveTime.current.rotate < 800) {
        return;
      }
      lastMoveTime.current.rotate = now;
      tetrisGameRef.current?.p.rotate();
      triggerGestureFeedback("Rotate");
    } else if (gesture === "Pointing Right") {
      if (now - lastMoveTime.current.right < 200) {
        return;
      }
      lastMoveTime.current.right = now;
      tetrisGameRef.current?.p.moveRight();
      triggerGestureFeedback("Move Right");
    } else if (gesture === "Pointing Left") {
      if (now - lastMoveTime.current.left < 200) {
        return;
      }
      lastMoveTime.current.left = now;
      tetrisGameRef.current?.p.moveLeft();
      triggerGestureFeedback("Move Left");
    }
  };

  const recognizeGesture = (landmarks: any[]): string => {
    const thumbTip = landmarks[4];
    const indexFingerTip = landmarks[8];
    const middleFingerTip = landmarks[12];
    const ringFingerTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const palmBase = landmarks[0];
    if (isHandOpen(landmarks)) {
      return "Palm";
    } else if (
      thumbTip.y < middleFingerTip.y &&
      thumbTip.y < ringFingerTip.y &&
      thumbTip.y < pinkyTip.y &&
      indexFingerTip.x < thumbTip.x &&
      isFingerStraight(landmarks, 1)
    ) {
      return "Pointing Right";
    } else if (
      thumbTip.y < middleFingerTip.y &&
      thumbTip.y < ringFingerTip.y &&
      thumbTip.y < pinkyTip.y &&
      indexFingerTip.x > thumbTip.x &&
      isFingerStraight(landmarks, 1)
    ) {
      return "Pointing Left";
    }

    return "Unknown";
  };

  const triggerGestureFeedback = (feedback: string) => {
    if (feedback === lastGesture) {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setGestureFeedback(null);
        setIsAnimating(false);
        setLastGesture(null);
      }, 1000);
      return;
    }

    setIsAnimating(true);
    setGestureFeedback(feedback);
    setLastGesture(feedback);

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setGestureFeedback(null);
      setIsAnimating(false);
      setLastGesture(null);
    }, 1000);
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
  const gameResultStyle =
    "block absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-20 bg-white bg-opacity-20 text-white text-6xl rounded-3xl text-center backdrop-blur-xl border-xl border-white border-opacity-20";
  const resultText = gameResult;
  const resultClass =
    resultText === "you WIN!" ? "animate-win" : "animate-lose";

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          videoRef.current!.play();
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
        });
    }
  }, []);

  return (
    <>
      <div className="grid-container">
        <div id="webcam-container">
          <div ref={gestureRef} />
          <video
            ref={videoRef}
            id="video"
            width="320"
            height="240"
            autoPlay
            className="hidden"
          />
          <canvas
            ref={canvasRef}
            id="canvas"
            width="320"
            height="240"
            className="hidden"
          />
          {gestureFeedback && (
            <div>
              {gestureFeedback === "Move Right" && (
                <Image
                  src="/image/right.png"
                  width={200}
                  height={200}
                  alt="right"
                />
              )}
              {gestureFeedback === "Move Left" && (
                <Image
                  src="/image/left.png"
                  width={200}
                  height={200}
                  alt="left"
                />
              )}
              {gestureFeedback === "Rotate" && (
                <Image
                  src="/image/rotate.png"
                  width={200}
                  height={200}
                  alt="rotate"
                />
              )}
              {gestureFeedback === "Drop" && (
                <Image
                  src="/image/drop.png"
                  width={200}
                  height={200}
                  alt="drop"
                />
              )}
            </div>
          )}
        </div>
        <div id="play-container">
          <div id="tetris-container" className="overflow-hidden">
            <NameLabel name={"USER1"} />
            <canvas
              ref={canvasTetrisRef}
              id="tetris"
              width="400"
              height="800"
            />
            <div ref={borderRef} id="tetris-border" />
          </div>
        </div>
        <div id="play-container">
          <NameLabel name={"USER2"} />
          <canvas
            ref={canvasTetris2Ref}
            id="tetrisCanvas2"
            width="400"
            height="800"
          ></canvas>
        </div>
        <div id="webcam-container">
          <div id="counter">
            {imageSrc && (
              <Image width={200} height={200} src={imageSrc} alt="profile" />
            )}
          </div>
          {imageSrc === "/image/guest_image.png" && (
            <span className="text-2xl text-green-400">User2</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-3">
        <div></div>
        <button
          type="button"
          onClick={handleReadyStartClick}
          className={`${
            isStart
              ? "hidden"
              : isOwner && !isAllReady
              ? "bg-gray-600 text-darkgray cursor-not-allowed"
              : "bg-gray-800 text-white border border-green-600 cursor-pointer hover:bg-gray-700 active:bg-gray-600"
          } p-6 m-4 w-full mx-auto border rounded-lg transition-transform transform hover:scale-105 hover:brightness-125 hover:shadow-xl`}
          disabled={(isOwner && !isAllReady) || false}
        >
          {isOwner
            ? isAllReady
              ? "Game Start"
              : "Waiting for Ready"
            : "Ready"}
        </button>
      </div>
      {/* LOSE, WIN 표시 DIV */}
      {gameResult && (
        <div
          id="gameResult"
          className={`${gameResultStyle} ${resultClass} press text-2xl leading-15`}
        >
          {gameResult}
        </div>
      )}
      <ThreeScene handLandmarks={landmarks} />
      <button
        type="button"
        style={{ backgroundColor: "red", color: "white", opacity: 0 }}
        onClick={handleClearButtonClick}
      >
        임시버튼(눌러서 set.clear())
      </button>
    </>
  );
};

export default Home;
