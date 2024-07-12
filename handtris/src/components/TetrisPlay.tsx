"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS, LandmarkList } from "@mediapipe/hands";
import { WebSocketManager } from "@/components/WebSocketManager";
import { Piece, TetrisGame } from "@/components/TetrisGame";
import { HandGestureManager } from "@/components/HandGestureManager";
import { isHandGood, isHandOpen } from "@/util/handLogic";
import Image from "next/image";
import { backgroundMusic, playSoundEffect } from "@/hook/howl";
import { getRoomCode } from "@/util/getRoomCode";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { HandLandmarkResults, TetrisBoard } from "@/types";
import WaitingModal, { Player } from "@/components/WaitingModal";
import LeftJoystickModel from "@/components/LeftJoystickModel";
import RightJoystickModel from "@/components/RightJoystickModel";
import GameResultModal from "@/components/GameResultModal";
import { searchRoomPlayer, updateStatus } from "@/services/gameService";
import { useMusic } from "./MusicProvider";

const TETRIS_CANVAS = `flex items-center justify-between w-full border-2 border-t-0`;

const Home: React.FC = () => {
  const { isMusicPlaying, toggleMusic } = useMusic();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isAllReady, setIsAllReady] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const { toast } = useToast();
  const [leftHandLandmarks, setLeftHandLandmarks] = useState<
    LandmarkList | undefined
  >();
  const [rightHandLandmarks, setRightHandLandmarks] = useState<
    LandmarkList | undefined
  >();
  const [otherUserJoined, setOtherUserJoined] = useState(false);
  const [linesCleared, setLinesCleared] = useState<number | null>(null);
  const [gauge, setGauge] = useState(0);
  const [showWaitingModal, setShowWaitingModal] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasTetrisRef = useRef<HTMLCanvasElement>(null);
  const canvasTetris2Ref = useRef<HTMLCanvasElement>(null);
  const nextBlockRef = useRef<HTMLCanvasElement>(null);
  const gestureRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const tetrisGameRef = useRef<TetrisGame | null>(null);
  const lastMoveTime = useRef({ right: 0, left: 0, rotate: 0, drop: 0 });
  const feedbackTimeoutRef = useRef<number | null>(null);
  const lastGestureRef = useRef<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchRoomPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const roomCode = getRoomCode();
      if (roomCode) {
        const response = await searchRoomPlayer(roomCode);
        if (response.data) {
          setRoomPlayers(response.data);
          setOtherUserJoined(response.data.length > 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch room players:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomPlayers();
  }, [fetchRoomPlayers]);

  const drawNextBlock = (nextBlock: Piece) => {
    const canvas = nextBlockRef.current;

    if (canvas && nextBlock) {
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        nextBlock.activeTetromino.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value && tetrisGameRef.current) {
              if (nextBlock.color === "orange") {
                tetrisGameRef.current.drawSquareCanvas(
                  context,
                  x + 1.3,
                  y + 0.5,
                  nextBlock.color,
                  false,
                );
              } else if (nextBlock.color === "blue") {
                tetrisGameRef.current.drawSquareCanvas(
                  context,
                  x + 0.5,
                  y - 0.1,
                  nextBlock.color,
                  false,
                );
              } else if (nextBlock.color === "green") {
                tetrisGameRef.current.drawSquareCanvas(
                  context,
                  x + 1.0,
                  y + 0.9,
                  nextBlock.color,
                  false,
                );
              } else if (nextBlock.color === "red") {
                tetrisGameRef.current.drawSquareCanvas(
                  context,
                  x + 1.0,
                  y + 1.0,
                  nextBlock.color,
                  false,
                );
              } else if (nextBlock.color === "yellow") {
                tetrisGameRef.current.drawSquareCanvas(
                  context,
                  x + 1.0,
                  y + 0.8,
                  nextBlock.color,
                  false,
                );
              } else {
                //"cyan"
                tetrisGameRef.current.drawSquareCanvas(
                  context,
                  x + 0.5,
                  y + 0.5,
                  nextBlock.color,
                  false,
                );
              }
            }
          });
        });
      }
    }
  };

  useEffect(() => {
    const roomCode = getRoomCode();
    const handleBeforeUnload = () => {
      if (wsManagerRef.current && wsManagerRef.current.connected) {
        wsManagerRef.current.sendMessageOnDisconnecting(
          {},
          `/app/${roomCode}/disconnect`,
          isStart,
        );
        wsManagerRef.current.disconnect();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isStart]);

  useEffect(() => {
    if (gameResult) {
      setShowResultModal(true);
      updateStatus(gameResult === "you WIN!" ? "WIN" : "LOSE");
    }
  }, [gameResult]);

  useEffect(() => {
    const roomCode = getRoomCode();
    if (tetrisGameRef.current) {
      tetrisGameRef.current.roomCode = roomCode;
    }
  });
  useEffect(() => {
    const roomCode = getRoomCode();

    const connectWebSocket = async () => {
      wsManagerRef.current = new WebSocketManager();
      try {
        await wsManagerRef.current.connect(
          "https://api.checkmatejungle.shop/ws",
        );
        subscribeToEntering(roomCode);
      } catch (error) {
        console.error("Failed to connect to WebSocket", error);
      }
    };

    connectWebSocket();
  }, []);

  useEffect(() => {
    const preventRefresh = (e: KeyboardEvent | BeforeUnloadEvent) => {
      if (e.type === "keydown") {
        const keyEvent = e as KeyboardEvent;
        if (
          keyEvent.key === "F5" ||
          (keyEvent.ctrlKey && keyEvent.key === "r")
        ) {
          keyEvent.preventDefault();
          showToast();
        }
      } else if (e.type === "beforeunload") {
        e.preventDefault();
        e.returnValue = "";
        showToast();
      }
    };

    const showToast = () => {
      toast({
        title: "새로고침 불가",
        description: "게임 중 새로고침은 허용되지 않습니다.",
        duration: 3000,
      });
    };

    window.addEventListener("keydown", preventRefresh as EventListener);
    window.addEventListener("beforeunload", preventRefresh);

    return () => {
      window.removeEventListener("keydown", preventRefresh as EventListener);
      window.removeEventListener("beforeunload", preventRefresh);
    };
  }, [toast]);

  const subscribeToEntering = useCallback(
    (roomCode: string | null) => {
      wsManagerRef.current?.subscribe(
        `/topic/owner/${roomCode}`,
        (message: unknown) => {
          const parsedMessage = message as { isOwner?: boolean };
          console.log("대기방에서 받는 메시지: ", parsedMessage);
          if (parsedMessage.isOwner !== undefined) {
            setIsOwner(prevIsOwner => {
              if (prevIsOwner === null) {
                if (parsedMessage.isOwner) {
                  return true;
                } else {
                  setOtherUserJoined(true);
                  fetchRoomPlayers(); // 상대방이 입장했을 때 플레이어 정보 다시 가져오기
                  return false;
                }
              } else if (prevIsOwner === true && !parsedMessage.isOwner) {
                setOtherUserJoined(true);
                fetchRoomPlayers(); // 상대방이 입장했을 때 플레이어 정보 다시 가져오기
              } else if (prevIsOwner === true && parsedMessage.isOwner) {
                setOtherUserJoined(false);
                fetchRoomPlayers(); // 상대방이 퇴장했을 때 플레이어 정보 다시 가져오기
              }
              return prevIsOwner;
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
    },
    [fetchRoomPlayers],
  );
  useEffect(() => {
    if (isOwner != null) {
      subscribeToState();
    }
  }, [isOwner]);

  useEffect(() => {
    if (gameResult) {
      const timeoutId = setTimeout(() => {
        setGameResult(null);
        setIsStart(false);
        setIsAllReady(false);
        setLinesCleared(null);
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
      }, 70000);

      return () => clearTimeout(timeoutId);
    }
  }, [gameResult]);

  const subscribeToState = async () => {
    const roomCode = getRoomCode();
    if (wsManagerRef.current && isOwner != null) {
      wsManagerRef.current.subscribe(
        `/topic/state/${roomCode}`,
        (message: { isReady: boolean; isStart: boolean }) => {
          console.log("대기 정보 message received: ", message);
          setIsAllReady(message.isReady);
          if (message.isStart && !isStart) {
            setIsStart(true);
            startGame(); // 클라이언트 시작 로직
          }
        },
      );
      console.log(`Subscribed to /topic/state/${roomCode}`);
    }
  };

  const handlePlayAgain = () => {
    setShowResultModal(false);
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
    setShowWaitingModal(true);
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
    setShowWaitingModal(false);
    await new Promise(resolve => setTimeout(resolve, 800));
    const roomCode = getRoomCode();
    const handsManager = new HandGestureManager(onResults);
    handsManager.start(videoRef.current!);
    const showCountdown = () => {
      return new Promise<void>(resolve => {
        let count = 3;
        const modals: HTMLElement[] = [];

        const createModal = (): HTMLElement => {
          const modal = document.createElement("div");
          modal.classList.add(
            "absolute",
            "top-1/2",
            "left-1/2",
            "transform",
            "-translate-x-1/2",
            "-translate-y-1/2",
            "text-white",
            "text-center",
            "transition-all",
            "duration-700",
          );
          return modal;
        };

        for (let i = 0; i < 4; i++) {
          const modal = createModal();
          modals.push(modal);
          document.querySelector(".modal-container")?.appendChild(modal);
        }

        const updateCountdown = () => {
          const modal = modals[3 - count];
          modal.innerHTML = count > 0 ? count.toString() : "Go!";
          modal.style.opacity = "1";
          modal.style.fontSize = "0rem";

          setTimeout(() => {
            modal.style.opacity = "0";
            modal.style.fontSize = "40rem";
          }, 100);
        };

        const countdownInterval = setInterval(() => {
          updateCountdown();
          count--;
          if (count < 0) {
            clearInterval(countdownInterval);
            setTimeout(() => {
              modals.forEach(modal =>
                document.querySelector(".modal-container")?.removeChild(modal),
              );
              resolve();
            }, 1000);
          }
        }, 1000);
      });
    };

    if (canvasTetrisRef.current && canvasTetris2Ref.current) {
      const ctx = canvasTetrisRef.current.getContext("2d")!;
      const ctx2 = canvasTetris2Ref.current.getContext("2d")!;
      try {
        wsManagerRef.current?.subscribe(
          `/user/queue/tetris/${roomCode}`,
          (message: {
            board: TetrisBoard;
            isEnd: boolean;
            isAttack: boolean;
            isGaugeFull: boolean;
          }) => {
            if (tetrisGameRef.current) {
              if (message.isEnd) {
                tetrisGameRef.current.gameEnd = true;
                backgroundMusic.pause();
                playSoundEffect("/sounds/winner.wav");
                setGameResult("you WIN!");
              }
              if (message.isAttack) {
                // tetrisGameRef.current.addBlockRow(); //NOTE - 실시간 공격 적용 시 이 부분 수정 필요
                tetrisGameRef.current.isAttacked = true;
              }
              if (message.isGaugeFull) {
                tetrisGameRef.current.isGaugeFullAttacked = true;
              }
              tetrisGameRef.current.drawBoard2(message.board);
            }
          },
        );
        await showCountdown();
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
    backgroundMusic.play();
    if (isMusicPlaying) {
      toggleMusic();
    }
  };
  useEffect(() => {
    if (tetrisGameRef.current) {
      if (
        !tetrisGameRef.current.isGaugeFull &&
        tetrisGameRef.current?.linesCleared % 4 === 3
      ) {
        tetrisGameRef.current.isGaugeFull = true;
      }
    }
  }, [linesCleared]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (tetrisGameRef.current) {
        setLinesCleared(tetrisGameRef.current.linesCleared);
        const currentGauge = tetrisGameRef.current.linesCleared % 4;
        setGauge(currentGauge);
        if (currentGauge === 3 && tetrisGameRef.current.linesCleared > 0) {
          setTimeout(() => {
            setGauge(0);
          }, 1000);
        }
        drawNextBlock(tetrisGameRef.current.getNextBlock());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onResults = useCallback((results: HandLandmarkResults) => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");

    if (!canvas || !canvasCtx) {
      console.error("Canvas or canvas context is not available");
      return;
    }
    const recognizeGesture = (
      landmarks: LandmarkList,
      handType: string,
    ): string => {
      const thumbTip = landmarks[4];
      const handBase = landmarks[17];

      if (handType === "Right") {
        // 플레이어 기준 왼손
        const thumbCalculateAngleRight = (
          thumbTip: LandmarkList[number],
          thumbBase: LandmarkList[number],
        ) => {
          const deltaY = thumbTip.y - thumbBase.y;
          const deltaX = thumbTip.x - thumbBase.x;
          const radians = Math.atan2(deltaX, deltaY);
          const degrees = radians * (180 / Math.PI);
          return degrees;
        };

        const thumbAngle = thumbCalculateAngleRight(handBase, thumbTip);
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
        const thumbCalculateAngleLeft = (
          thumbTip: LandmarkList[number],
          thumbBase: LandmarkList[number],
        ) => {
          const deltaY = thumbTip.y - thumbBase.y;
          const deltaX = thumbTip.x - thumbBase.x;
          const radians = Math.atan2(deltaX, deltaY);
          const degrees = radians * (180 / Math.PI);
          return degrees;
        };

        const thumbAngle = thumbCalculateAngleLeft(handBase, thumbTip);
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

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i] as LandmarkList;
        const classification = results.multiHandedness[i];
        const handType = classification.label;
        const landmarkColor = handType === "Left" ? "#FF0000" : "#0A8008";
        for (let j = 0; j < landmarks.length; j++) {
          // 랜드마크 위치 좌우 반전
          landmarks[j].x = 1 - landmarks[j].x;
        }
        drawLandmarks(canvasCtx, landmarks, {
          color: landmarkColor,
          lineWidth: 0.1,
        });
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#ffffff",
          lineWidth: 1,
        });
        for (let j = 0; j < landmarks.length; j++) {
          // 랜드마크 위치 원복
          landmarks[j].x = 1 - landmarks[j].x;
        }
        const gesture = recognizeGesture(landmarks, handType);
        if (handType === "Left") {
          setLeftHandLandmarks(landmarks);
        } else {
          setRightHandLandmarks(landmarks);
        }
        handleGesture(gesture, handType);
      }
      if (borderRef.current) {
        borderRef.current.style.boxShadow = "none";
      }
    } else {
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
      } else if (gesture == "Pointing Right") {
        console.log("Pointing Right");
        if (now - lastMoveTime.current.drop < 1000) {
        } else {
          lastMoveTime.current.drop = now;
          tetrisGameRef.current?.moveToGhostPosition();
          triggerGestureFeedback("Drop");
          const playTetrisElement = document.getElementById("tetris-container");
          if (playTetrisElement) {
            playTetrisElement.classList.add("shake");

            setTimeout(() => {
              playTetrisElement.classList.remove("shake");
            }, 200);
          }
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
        setLastGesture(null);
      }, 1000);
      return;
    }

    setGestureFeedback(feedback);
    setLastGesture(feedback);

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setGestureFeedback(null);
      setLastGesture(null);
    }, 1000);
  };

  const handleReadyStartClick = () => {
    if (!otherUserJoined) {
      toast({
        title: "대기 중",
        description: "상대방이 입장할 때까지 기다려주세요.",
        duration: 3000,
      });
      return;
    }

    if (isOwner) {
      if (isAllReady) {
        handleStartGameClick();
      }
    } else {
      handleReadyClick();
    }
  };

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

  return (
    <div className="relative">
      <AnimatePresence>
        {showWaitingModal && (
          <WaitingModal
            isOpen={showWaitingModal}
            wsManager={wsManagerRef.current!}
            isLoading={isLoading}
            onClose={() => setShowWaitingModal(false)}
            onReady={handleReadyStartClick}
            isOwner={isOwner}
            isAllReady={isAllReady}
            players={roomPlayers}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: "-100%" }}
        animate={{
          opacity: showWaitingModal ? 0 : 1,
          y: showWaitingModal ? "-100%" : 0,
        }}
        transition={{ duration: 0.5, delay: showWaitingModal ? 0 : 0.5 }}
      >
        <div className="">
          <div className="flex justify-center items-center flex-cols-2 gap-[400px]">
            <div className="press bg-white text-center text-4xl text-black border-4 ml-11 m-5 pl-4 pr-4">
              {roomPlayers[0]?.nickname || "CHOCO"}
            </div>
            <div className="press bg-white text-center text-4xl text-black border-4 ml-16 pl-4 pr-4">
              {roomPlayers[1]?.nickname || "LUCKY UNICORN"}
            </div>
          </div>
          <div className="flex items-center justify-around relative">
            <div className="modal-container absolute inset-0 z-10 flex items-center justify-center"></div>
            <div className="relative flex">
              <div className="flex w-[20px] flex-col-reverse border-2">
                <div
                  className="w-full transition-all duration-700 ease-in-out"
                  style={{
                    height: `${(gauge / 3) * 100}%`,
                    background: "linear-gradient(to top, green, lightgreen)",
                  }}
                ></div>
              </div>
              <div
                id="tetris-container"
                className="flex flex-col justify-between"
              >
                <div className={`${TETRIS_CANVAS}`}>
                  <canvas
                    ref={canvasTetrisRef}
                    id="tetris"
                    width="300"
                    height="600"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <div className="flex flex-cols-2 gap-[50px]">
                  <div className="flex h-[150px] w-[150px] flex-col border-4 border-l-0 border-t-0">
                    <div className="press bg-white text-center text-2xl text-black">
                      NEXT
                    </div>
                    <canvas
                      ref={nextBlockRef}
                      width="150"
                      height="150"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex h-[150px] w-[150px] flex-col border-4 border-t-0 ">
                    <div className="press bg-white text-center text-xl text-black">
                      Attack
                    </div>
                    <div className="text-center text-[60px] p-2 text-white">
                      {linesCleared !== null ? linesCleared : 0}
                    </div>
                  </div>
                </div>
                <div className="flex h-[300px] w-[350px] flex-col border-4 border-l-0 border-t-0">
                  <div className="press bg-white text-center text-2xl text-black">
                    Your Hands
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0">
                      <canvas
                        ref={canvasRef}
                        id="canvas"
                        width="350"
                        height="271"
                        className=""
                      />
                    </div>
                    <div className="absolute inset-0"></div>
                  </div>
                </div>
              </div>
            </div>
            <div id="opposer_tetris" className="relative flex">
              <div className="tetris_opposer flex flex-col justify-between">
                <div className={`${TETRIS_CANVAS}`}>
                  <canvas
                    ref={canvasTetris2Ref}
                    id="tetrisCanvas2"
                    width="300"
                    height="600"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-between">
                <div className="flex h-[150px] w-[150px] flex-col border-[3px]">
                  <Image
                    src={
                      roomPlayers[1]?.profileImageUrl || "/image/profile_1.jpeg"
                    }
                    width={150}
                    height={100}
                    alt="profile"
                    className="h-full w-full overflow-hidden object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 조이스틱 모델 및 제스쳐 피드백 부분 */}
          <div className="flex justify-start items-center gap-2 ml-[50px]">
            <div className="flex justify-center items-center">
              <Image
                src={
                  gestureFeedback === "Move Left"
                    ? "/image/MoveLeftPressed.png"
                    : "/image/MoveLeftDefault.png"
                }
                alt="Move Left"
                width={85}
                height={85}
              />
            </div>
            <LeftJoystickModel handLandmarks={rightHandLandmarks} />
            <div className="flex justify-center items-center">
              <Image
                src={
                  gestureFeedback === "Move Right"
                    ? "/image/MoveRightPressed.png"
                    : "/image/MoveRightDefault.png"
                }
                alt="Move Right"
                width={85}
                height={85}
              />
            </div>
            <div className="flex justify-center items-center">
              <Image
                src={
                  gestureFeedback === "Rotate"
                    ? "/image/RotatePressed.png"
                    : "/image/RotateDefault.png"
                }
                alt="Rotate"
                width={85}
                height={85}
              />
            </div>
            <RightJoystickModel handLandmarks={leftHandLandmarks} />
            <div className="flex justify-center items-center">
              <Image
                src={
                  gestureFeedback === "Drop"
                    ? "/image/DropPressed.png"
                    : "/image/DropDefault.png"
                }
                alt="Drop"
                width={85}
                height={85}
              />
            </div>
          </div>
          <AnimatePresence>
            {showResultModal && (
              <GameResultModal
                result={gameResult === "you WIN!" ? "WIN" : "LOSE"}
                onPlayAgain={handlePlayAgain}
                linesCleared={linesCleared || 0}
              />
            )}
          </AnimatePresence>
          <div className="fixed bottom-4 left-4">
            <div ref={gestureRef} />
            <video
              ref={videoRef}
              id="video"
              width="320"
              height="240"
              autoPlay
              className="hidden"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
