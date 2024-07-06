"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { WebSocketManager } from "@/components/WebSocketManager";
import { TetrisGame } from "@/components/TetrisGame";
import { HandGestureManager } from "@/components/HandGestureManager";
import {
  isFingerStraight,
  isHandBent,
  isHandGood,
  isHandOpen,
} from "@/util/handLogic";
import Image from "next/image";
import ThreeScene from "@/components/ThreeScene";
import { NAME_LABEL, NameLabel } from "@/styles";
import { backgroundMusic, playSoundEffect } from "@/hook/howl";
import GestureFeedback from "@/components/GestureFeedback";
import { BoardDesc } from "@/components/BoardDesc";
import { getRoomCode } from "@/util/getRoomCode";
import { getAccessToken } from "@/util/getAccessToken";

const TETRIS_CANVAS = `flex items-center justify-between w-full border-2 border-t-0`;
const Home: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isAllReady, setIsAllReady] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  const [gesture, setGesture] = useState<string>("디폴트");
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<string | null>(null);

  const [landmarks, setLandmarks] = useState<any>();
  const [leftHandLandmarks, setLeftHandLandmarks] = useState<any>();
  const [rightHandLandmarks, setRightHandLandmarks] = useState<any>();

  const [linesCleared, setLinesCleared] = useState(0);
  const [gauge, setGauge] = useState(0);
  const [isGaugeFull, setIsGaugeFull] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasTetrisRef = useRef<HTMLCanvasElement>(null);
  const canvasTetris2Ref = useRef<HTMLCanvasElement>(null);
  const gestureRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const tetrisGameRef = useRef<TetrisGame | null>(null);
  const lastMoveTime = useRef({ right: 0, left: 0, rotate: 0, drop: 0 });
  const feedbackTimeoutRef = useRef<number | null>(null);
  const lastMiddleTipheight = useRef({ before: 0, now: 0 });
  const lastGestureRef = useRef<string | null>(null);

  useEffect(() => {
    const roomCode = getRoomCode();
    if (tetrisGameRef.current) {
      tetrisGameRef.current.roomCode = roomCode; //NOTE - 게임 끝나고도 roomCode 잘 적용되는지 확인
    }
  });
  useEffect(() => {
    const roomCode = getRoomCode();
    const token = getAccessToken();

    const connectWebSocket = async () => {
      wsManagerRef.current = new WebSocketManager();
      try {
        await wsManagerRef.current.connect(
          "https://api.checkmatejungle.shop/ws",
          token,
        );
        setIsConnected(true);
        subscribeToEntering(roomCode);
      } catch (error) {
        console.error("Failed to connect to WebSocket", error);
      }
    };

    connectWebSocket();
  }, []);

  const subscribeToEntering = (roomCode: string) => {
    wsManagerRef.current?.subscribe(
      `/topic/owner/${roomCode}`,
      (message: any) => {
        console.log("대기방에서 받는 메시지: ", message);
        if (message.isOwner !== undefined) {
          setIsOwner(prevIsOwner => {
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
      },
    );

    if (roomCode) {
      wsManagerRef.current?.sendMessageOnEntering(
        {},
        `/app/${roomCode}/owner/info`,
      );
    }
  };

  useEffect(() => {
    if (isOwner != null) {
      subscribeToState();
    }
  }, [isOwner]);
  // 게임 종료 시 결과 표시 모달 지우고, 게임 시작 관련 상태 초기화
  useEffect(() => {
    if (gameResult) {
      const timeoutId = setTimeout(() => {
        setGameResult(null);
        setIsStart(false);
        setIsAllReady(false);
        setLinesCleared(0);
        setGauge(0);
        if (tetrisGameRef.current) {
          tetrisGameRef.current.linesCleared = 0;
        }
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
      }, 3000); // 3 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [gameResult]);

  const subscribeToState = async () => {
    const roomCode = getRoomCode();
    if (wsManagerRef.current && isOwner != null) {
      wsManagerRef.current.subscribe(
        `/topic/state/${roomCode}`,
        (message: any) => {
          console.log("대기 정보 message received: ", message);
          setIsAllReady(message.isReady);
          if (message.isStart && !isStart) {
            setIsStart(true);
            startGame(); // 클라이언트 시작 로직
            console.log("게임 시작됨");
          }
        },
      );
      console.log(`Subscribed to /topic/state/${roomCode}`);
    }
  };

  const handleReadyClick = async () => {
    const roomCode = getRoomCode();
    try {
      wsManagerRef.current?.sendMessageOnWaiting(
        {
          isAllReady: true,
          isStart: false,
        },
        `/app/${roomCode}/tetris/ready`,
      );
      console.log(`Message sent to /app/${roomCode}/tetris/ready`);
    } catch (error) {
      console.error(
        `Failed to send message to /app/${roomCode}/tetris/ready`,
        error,
      );
    }
  };

  const handleStartGameClick = async () => {
    const roomCode = getRoomCode();
    try {
      wsManagerRef.current?.sendMessageForStart(
        {
          isAllReady: true,
          isStart: true,
        },
        `/app/${roomCode}/tetris/start`,
      );
      console.log("Message sent to start the game");
    } catch (error) {
      console.error("Failed to send message to start the game", error);
    }
  };

  const startGame = async () => {
    const roomCode = getRoomCode();
    const token = getAccessToken();
    if (canvasTetrisRef.current && canvasTetris2Ref.current) {
      const ctx = canvasTetrisRef.current.getContext("2d")!;
      const ctx2 = canvasTetris2Ref.current.getContext("2d")!;
      try {
        wsManagerRef.current?.subscribe(
          `/user/queue/tetris/${roomCode}`,
          (message: any) => {
            if (tetrisGameRef.current) {
              tetrisGameRef.current.drawBoard2(message.board);
              if (message.isEnd) {
                tetrisGameRef.current.gameEnd = true;
                backgroundMusic.pause();
                playSoundEffect("/sounds/winner.wav");
                setGameResult("you WIN!");
              }
            }
          },
        );
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

    const handsManager = new HandGestureManager(onResults);
    handsManager.start(videoRef.current!);

    backgroundMusic.play();
  };

  useEffect(() => {
    let previousGauge = 0;
    const interval = setInterval(() => {
      if (tetrisGameRef.current) {
        setLinesCleared(tetrisGameRef.current.linesCleared);
        const currentGauge = tetrisGameRef.current.linesCleared % 5;
        // 이전 gauge 값과 현재 gauge 값을 비교하여 4를 지나쳤다면 setGauge(4) 호출
        if (
          (previousGauge < 4 && currentGauge < previousGauge) ||
          (previousGauge < 4 && currentGauge >= 4)
        ) {
          setGauge(4);
        }
        setGauge(currentGauge);
        previousGauge = currentGauge;
        if (currentGauge === 4 && tetrisGameRef.current.linesCleared > 0) {
          setIsGaugeFull(true);
          setTimeout(() => {
            setIsGaugeFull(false);
            setGauge(0);
          }, 2000);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onResults = useCallback((results: any) => {
    const canvasCtx = canvasRef.current!.getContext("2d")!;
    const recognizeGesture = (landmarks: any[], handType: string): string => {
      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const handBase = landmarks[17];
      const indexFingerTip = landmarks[8];
      const middleFingerTip = landmarks[12];
      const ringFingerTip = landmarks[16];
      const pinkyTip = landmarks[20];

      if (handType === "Right") {
        // 플레이어 기준 왼손
        const thumbCalculateAngle = (thumbTip: any, thumbBase: any) => {
          const deltaY = thumbTip.y - thumbBase.y;
          const deltaX = thumbTip.x - thumbBase.x;
          const radians = Math.atan2(deltaX, deltaY);
          const degrees = radians * (180 / Math.PI);
          return degrees;
        };

        const thumbAngle = thumbCalculateAngle(handBase, thumbTip);
        const rightAngleThreshold = 30;
        const leftAngleThreshold = 10;
        if (isHandOpen(landmarks)) {
          return "Palm";
        }
        if (thumbAngle < -leftAngleThreshold && isHandGood(landmarks)) {
          return "Pointing Left";
        }
        if (thumbAngle > rightAngleThreshold && isHandGood(landmarks)) {
          return "Pointing Right";
        }
      } else {
        // 플레이어 기준 오른손
        const thumbCalculateAngle = (thumbTip: any, thumbBase: any) => {
          const deltaY = thumbTip.y - thumbBase.y;
          const deltaX = thumbTip.x - thumbBase.x;
          const radians = Math.atan2(deltaX, deltaY);
          const degrees = radians * (180 / Math.PI);
          return degrees;
        };

        const thumbAngle = thumbCalculateAngle(handBase, thumbTip);
        const rightAngleThreshold = 10;
        const leftAngleThreshold = 30;
        if (isHandOpen(landmarks)) {
          return "Palm";
        }
        if (thumbAngle < -leftAngleThreshold && isHandGood(landmarks)) {
          return "Pointing Left";
        }
        if (thumbAngle > rightAngleThreshold && isHandGood(landmarks)) {
          return "Pointing Right";
        }
      }
      return "Unknown";
    };

    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height,
    );
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height,
    );

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const landmarks = results.multiHandLandmarks[i];
          const classification = results.multiHandedness[i];
          const handType = classification.label;

          const landmarkColor = handType === "Left" ? "#0000FF" : "#FF0000";
          drawLandmarks(canvasCtx, landmarks, {
            color: landmarkColor,
            lineWidth: 0.1,
          });
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 1,
          });

          const gesture = recognizeGesture(landmarks, handType);
          if (handType === "Left") {
            setGesture(gesture);
            setLeftHandLandmarks(landmarks);
          } else {
            setRightHandLandmarks(landmarks);
          }

          if (gestureRef.current) {
            gestureRef.current.innerText = `Gesture : ${gesture}`;
          }

          handleGesture(gesture, handType);
          setLandmarks(results.multiHandLandmarks);
        }
        if (borderRef.current) {
          borderRef.current.style.boxShadow = "none";
        }
      }
    } else {
      if (gestureRef.current) {
        gestureRef.current.innerText = "Gesture : None";
      }
      if (borderRef.current) {
        borderRef.current.style.boxShadow = "0 0 20px 20px red";
      }
    }
    canvasCtx.restore();
  }, []);

  const handleGesture = (gesture: string, handType: string) => {
    const now = Date.now();

    if (handType === "Right") {
      if (gesture === "Pointing Right") {
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
    } else {
      // handType이 "left"이면
      if (gesture == "Pointing Left") {
        console.log("Pointing Left");
        if (now - lastMoveTime.current.rotate < 1000) {
        } else {
          lastMoveTime.current.rotate = now;
          tetrisGameRef.current?.p.rotate();
          triggerGestureFeedback("Rotate");
        }

        const playTetrisElement = document.getElementById("play-tetris");
        if (playTetrisElement) {
          playTetrisElement.classList.add("shake");

          setTimeout(() => {
            playTetrisElement.classList.remove("shake");
          }, 200);
        }
      } else if (gesture == "Pointing Right") {
        console.log("Pointing Right");
        if (now - lastMoveTime.current.drop < 1000) {
        } else {
          lastMoveTime.current.drop = now;
          tetrisGameRef.current?.moveToGhostPosition();
          triggerGestureFeedback("Drop");
        }
      }
      lastGestureRef.current = gesture;
    }
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
        },
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
        .then(stream => {
          videoRef.current!.srcObject = stream;
          videoRef.current!.play();
        })
        .catch(err => {
          console.error("Error accessing webcam: ", err);
        });
    }
  }, []);
  //   const [count, setCount] = useState(0);
  //   useEffect(() => {
  //     if (count === 0) {
  //       startGame();
  //       setCount(1);
  //     }
  //   }, [count]);
  return (
    <>
      <div className="flex items-center justify-around">
        <div className="flex h-[802px]">
          <div className="flex h-full w-[50px] flex-col-reverse border-2 p-4">
            <div
              className="w-full transition-all duration-700 ease-in-out"
              style={{
                height: `${(gauge / 4) * 100}%`,
                background: "linear-gradient(to top, green, lightgreen)",
              }}
            ></div>
          </div>
          <div id="tetris-container">
            <div className={`${TETRIS_CANVAS}`}>
              <canvas
                ref={canvasTetrisRef}
                id="tetris"
                width="400"
                height="800"
              />
              <div ref={borderRef} id="tetris-border" />
            </div>
            <NameLabel name={"USER1"} />
          </div>
          <div className="flex h-[250px] w-[250px] flex-col border-4 border-l-0 border-t-0">
            <div className="press bg-white text-center text-2xl text-black">
              NEXT
            </div>
          </div>
        </div>
        <div className="flex h-[802px]">
          <div className="tetris_opposer">
            <div className={`${TETRIS_CANVAS}`}>
              <canvas
                ref={canvasTetris2Ref}
                id="tetrisCanvas2"
                width="400"
                height="800"
              />
            </div>
            <NameLabel name={"USER2"} />
          </div>
          <div className="flex flex-col items-center justify-between">
            <div className="flex h-[250px] w-[250px] flex-col border-4 border-l-0 border-t-0">
              <h1 className="press bg-white text-center text-2xl text-black">
                IMAGE
              </h1>
              <Image
                src="/image/profile-pic.jpeg"
                width={250}
                height={200}
                alt="profile"
                className="h-full w-full overflow-hidden object-cover"
              />
            </div>
            <div className="w-[50%] text-white">
              <BoardDesc type="Score" desc={1700} />
              <BoardDesc type="Lines" desc={linesCleared} />
            </div>
          </div>
        </div>
      </div>
      <div className="fixed left-0 top-[50%] columns-2">
        <ThreeScene handLandmarks={rightHandLandmarks} />
        <ThreeScene handLandmarks={leftHandLandmarks} />
      </div>
      <div>
        <div>
          {imageSrc === "/image/guest_image.png" && (
            <span className="text-2xl text-green-400">User2</span>
          )}
        </div>
        <p className="text-2xl text-green-400">{gesture}</p>
        <button
          type="button"
          onClick={handleReadyStartClick}
          className={`${
            isStart
              ? "hidden"
              : isOwner && !isAllReady
                ? "text-darkgray cursor-not-allowed bg-gray-600"
                : "cursor-pointer border border-green-600 bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600"
          } mx-auto w-[400px] transform border p-3 transition-transform hover:scale-105 hover:shadow-xl hover:brightness-125`}
          disabled={(isOwner && !isAllReady) || false}
        >
          {isOwner
            ? isAllReady
              ? "Game Start"
              : "Waiting for Ready"
            : "Ready"}
        </button>
      </div>
      {gameResult && (
        <div
          id="gameResult"
          className={`${gameResultStyle} ${resultClass} press leading-15 text-2xl`}
        >
          {gameResult}
        </div>
      )}
      <button
        type="button"
        className="fixed left-0 top-5 bg-red-400 text-white"
        onClick={handleClearButtonClick}
      >
        임시버튼(눌러서 set.clear())
      </button>
      <div className="fixed bottom-0 left-0">
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
          className=""
        />
        {gestureFeedback && (
          <GestureFeedback gestureFeedback={gestureFeedback} />
        )}
      </div>
    </>
  );
};

export default Home;
