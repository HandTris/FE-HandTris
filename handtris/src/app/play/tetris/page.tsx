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

const TETRIS_CANVAS = `flex items-center justify-between w-full border-2 border-t-0`;
const Home: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isAllReady, setIsAllReady] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  const [gesture, setGesture] = useState<string>("디폴트"); //FIXME -  손동작 튜닝을 위한 임시 상태값
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<string | null>(null);

  const [landmarks, setLandmarks] = useState();

  const [linesCleared, setLinesCleared] = useState(0);
  const [gauge, setGauge] = useState(0);
  const [isGaugeFull, setIsGaugeFull] = useState(false);

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
  const lastMoveTime = useRef({ right: 0, left: 0, rotate: 0, drop: 0 });
  const feedbackTimeoutRef = useRef<number | null>(null);
  const lastMiddleTipheight = useRef({ before: 0, now: 0 });
  const lastGestureRef = useRef<string | null>(null);

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

  //0.075초 전 높이 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      lastMiddleTipheight.current.before = lastMiddleTipheight.current.now;
    }, 50);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (isOwner != null) {
      subscribeToState();
    }
  }, [isOwner]);

  const subscribeToState = async () => {
    if (!wsWaitingManagerRef.current) {
      wsWaitingManagerRef.current = new WebSocketManager();
    }
    try {
      await wsWaitingManagerRef.current.connect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ws`,
        "/topic/state",
        (message: any) => {
          console.log("대기 정보 message received: ", message);
          setIsAllReady(message.isReady);
          if (message.isStart) {
            setIsStart(true);
            startGame(); // 클라이언트 시작 로직
          }
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
          `${process.env.NEXT_PUBLIC_BASE_URL}/ws`,
          "/user/queue/tetris",
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
          }
        );
        tetrisGameRef.current = new TetrisGame(
          ctx,
          ctx2,
          wsPlayManagerRef.current,
          setGameResult
        );
        setLinesCleared(tetrisGameRef.current.linesCleared);
      } catch (error) {
        console.error("Failed to connect to WebSocket for game", error);
      }
    }

    const handsManager = new HandGestureManager(onResults);
    handsManager.start(videoRef.current!);

    backgroundMusic.play();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (tetrisGameRef.current) {
        setLinesCleared(tetrisGameRef.current.linesCleared);
        setGauge(tetrisGameRef.current.linesCleared % 5);
        if (
          tetrisGameRef.current.linesCleared % 5 === 4 &&
          tetrisGameRef.current.linesCleared > 0
        ) {
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
      const handBase = landmarks[17]; // 주먹의 맨 밑
      const indexFingerTip = landmarks[8];
      const middleFingerTip = landmarks[12];
      const ringFingerTip = landmarks[16];
      const pinkyTip = landmarks[20];
      const palmBase = landmarks[0];

      // 시작 ------------ (사람 기준)엄지 손가락 제스처 ------------ //
      if (handType === "Right") {
        // 각도 계산 함수
        const thumbCalculateAngle = (thumbTip: any, thumbBase: any) => {
          const deltaY = thumbTip.y - thumbBase.y;
          const deltaX = thumbTip.x - thumbBase.x;
          const radians = Math.atan2(deltaX, deltaY);
          const degrees = radians * (180 / Math.PI);
          return degrees;
        };

        // 엄지의 각도 계산
        const thumbAngle = thumbCalculateAngle(handBase, thumbTip);

        // 일정 각도 이상이어야 제스처로 인식
        const rightAngleThreshold = 30;
        const leftAngleThreshold = 10;
        if (isHandOpen(landmarks)) {
          return "Palm";
        }
        if (thumbAngle < -leftAngleThreshold && isHandGood(landmarks)) {
          return "Pointing Left";
        } else if (thumbAngle > rightAngleThreshold && isHandGood(landmarks)) {
          return "Pointing Right";
        }
        // 끝 ------------ (사람 기준) 왼손 엄지 손가락 제스처 ------------ //
      } else {
        // 시작 ---------- (사람 기준)오른손 제스처 ------------ //
        lastMiddleTipheight.current.now = middleFingerTip.y; // 현재 중지 끝의 높이 업데이트

        if (
          wrist.y < indexFingerTip.y &&
          wrist.y < middleFingerTip.y &&
          wrist.y < ringFingerTip.y &&
          wrist.y < pinkyTip.y &&
          isFingerStraight(landmarks, 1) &&
          isFingerStraight(landmarks, 2) &&
          isFingerStraight(landmarks, 3) &&
          isFingerStraight(landmarks, 4)
        ) {
          if (wrist.x > ringFingerTip.x) {
            return "오른쪽 손등 보자기";
          }
          if (wrist.x < pinkyTip.x) {
            return "왼쪽 손등 보자기";
          }
          return "손등";
        }
        lastMiddleTipheight.current.before = lastMiddleTipheight.current.now;
        if (isHandBent(landmarks)) {
          return "주먹 쥠";
        }
        if (isHandGood(landmarks)) {
          return "따봉";
        } else if (isHandOpen(landmarks)) {
          return "보자기";
        } else if (
          isFingerStraight(landmarks, 1) &&
          isFingerStraight(landmarks, 2) &&
          isFingerStraight(landmarks, 3) &&
          isFingerStraight(landmarks, 4)
        ) {
          return " 엄지 빼고 다 핌";
        } else if (
          thumbTip.y < middleFingerTip.y &&
          thumbTip.y < ringFingerTip.y &&
          thumbTip.y < pinkyTip.y &&
          indexFingerTip.x < thumbTip.x &&
          isFingerStraight(landmarks, 1)
        ) {
          return "불필요 제스쳐1";
        } else if (
          thumbTip.y < middleFingerTip.y &&
          thumbTip.y < ringFingerTip.y &&
          thumbTip.y < pinkyTip.y &&
          indexFingerTip.x > thumbTip.x &&
          isFingerStraight(landmarks, 1)
        ) {
          return "불필요 제스쳐2";
        }
      }
      return "Unknown";
    };

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
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const landmarks = results.multiHandLandmarks[i];
          const classification = results.multiHandedness[i]; // handedness 정보 가져오기
          // handedness 정보에서 손 종류 확인
          const handType = classification.label; // 'Left' 또는 'Right' 값을 가짐

          // 손 종류에 따라 랜드마크 색상 변경
          const landmarkColor = handType === "Left" ? "#0000FF" : "#FF0000"; // 왼손 파란색, 오른손 빨간색
          drawLandmarks(canvasCtx, landmarks, {
            color: landmarkColor,
            lineWidth: 0.1,
          });
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 1,
          });

          const gesture = recognizeGesture(landmarks, handType);
          console.log("제스쳐: ", gesture);
          if (handType === "Left") {
            //FIXME - 손동작 튜닝을 위한 임시 상태값
            setGesture(gesture); // 왼손의 상태만 나오도록 조건문 안에 넣음
          }

          // 현재 제스쳐 출력
          if (gestureRef.current) {
            gestureRef.current.innerText = "Gesture : " + gesture;
          }

          handleGesture(gesture, handType); // 제스처에 따라 블록 이동 처리
          setLandmarks(results.multiHandLandmarks); // landmarks 업데이트
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
    // 화상 기준 오른손(사람 기준 왼손)일 경우
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
    }
    // 왼손일 경우
    else {
      if (gesture === null) {
        lastMiddleTipheight.current.now = lastMiddleTipheight.current.before;
      }
      if (gesture === "보자기") {
      } else if (
        gesture == "왼쪽 손등 보자기" &&
        lastMiddleTipheight.current.now - lastMiddleTipheight.current.before >
          0.05
      ) {
        console.log("왼쪽 손등 보자기");
        if (now - lastMoveTime.current.rotate < 200) {
          // 0.2초내에 같은게 들어오면 패스
        } else {
          lastMoveTime.current.rotate = now;
          tetrisGameRef.current?.p.rotate();
          triggerGestureFeedback("Rotate");
        }
        lastMoveTime.current.rotate = now;
        tetrisGameRef.current?.p.rotate();
        triggerGestureFeedback("Rotate");

        // 캔버스에 흔들림 애니메이션 추가
        const playTetrisElement = document.getElementById("play-tetris");
        if (playTetrisElement) {
          playTetrisElement.classList.add("shake");

          // 애니메이션 종료 후 클래스 제거
          setTimeout(() => {
            playTetrisElement.classList.remove("shake");
          }, 200);
        }
      } else if (
        gesture == "오른쪽 손등 보자기" &&
        lastMiddleTipheight.current.now - lastMiddleTipheight.current.before >
          0.05
      ) {
        // 0.2초내에 같은게 들어오면 패스
        console.log("오른쪽 손등 보자기");
        if (now - lastMoveTime.current.drop < 200) {
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
      <div className="flex items-center justify-around">
        <div className="flex h-[802px]">
          <div className="flex flex-col border-2 h-full w-[50px] p-4" />
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
          <div className="flex flex-col border-4 h-[250px] w-[250px] border-l-0 border-t-0">
            <div className="text-black bg-white press text-center text-2xl">
              NEXT
            </div>
          </div>
        </div>
        {/*  */}
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
          <div className="flex flex-col justify-between items-center">
            <div className="flex flex-col border-4 h-[250px] w-[250px] border-l-0 border-t-0">
              <h1 className="text-black bg-white press text-center text-2xl">
                IMAGE
              </h1>
              <Image
                src="/image/profile-pic.jpeg"
                width={250}
                height={200}
                alt="profile"
                className="overflow-hidden object-cover w-full h-full"
              />
            </div>
            <div className="text-white w-[50%]">
              <BoardDesc type="Score" desc={1700} />
              <BoardDesc type="Lines" desc={linesCleared} />
            </div>
          </div>
        </div>
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
              ? "bg-gray-600 text-darkgray cursor-not-allowed"
              : "bg-gray-800 text-white border border-green-600 cursor-pointer hover:bg-gray-700 active:bg-gray-600"
          } p-3 w-[400px] mx-auto border transition-transform transform hover:scale-105 hover:brightness-125 hover:shadow-xl`}
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
      <div className="fixed left-0 top-[50%]">
        <ThreeScene handLandmarks={landmarks} />
      </div>
      <button
        type="button"
        className="bg-red-400 text-white fixed top-5 left-0"
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

//  <div
//    id="gage_bar"
//    className=" w-[30px] h-[800px] border border-gray-600 bg-gray-300 flex flex-col-reverse"
//  >
//    <div
//      className="w-full transition-all duration-700 ease-in-out"
//      style={{
//        height: `${(gauge / 4) * 100}%`,
//        background: "linear-gradient(to top, green, lightgreen)",
//      }}
//    />
//  </div>;

//
