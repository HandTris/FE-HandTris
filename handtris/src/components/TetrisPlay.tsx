"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { WebSocketManager } from "@/components/WebSocketManager";
import { TetrisGame } from "@/components/TetrisGame";
import { HandGestureManager } from "@/components/HandGestureManager";
import Image from "next/image";
import { playSoundEffect } from "@/hook/howl";
import { getRoomCode } from "@/util/getRoomCode";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { HandLandmarkResults, TetrisBoard } from "@/types";
import WaitingModal from "@/components/WaitingModal";
import LeftJoystickModel from "@/components/LeftJoystickModel";
import RightJoystickModel from "@/components/RightJoystickModel";
import GameResultModal from "@/components/GameResultModal";
import { useMusic } from "./MusicProvider";
import ConfettiExplosion from "react-confetti-explosion";
import { ArrowUpNarrowWide, Donut, FlipVertical2 } from "lucide-react";
import { LandmarkList } from "@mediapipe/hands";
import { drawNextBlock } from "./drawNextBlock";
import { showCountdown } from "./showCountdown";
import { useHandleGesture } from "@/hook/useHandleGesture";
import { updateStatus } from "@/services/gameService";
import useFetchRoomPlayers from "@/hook/fetchRoomPlayers";
import useSubscribeToEntering from "@/hook/useSubscribeToEntering";
import { TETRIS_CANVAS } from "@/styles";

const Home: React.FC = () => {
  const { toggleMusic, stopAllMusic } = useMusic();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isAllReady, setIsAllReady] = useState(false);
  const [isReady, setIsReady] = useState(false);
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
  const [linesCleared, setLinesCleared] = useState<number | null>(null);
  const [gauge, setGauge] = useState(0);
  const [showWaitingModal, setShowWaitingModal] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasTetrisRef = useRef<HTMLCanvasElement>(null);
  const canvasTetris2Ref = useRef<HTMLCanvasElement>(null);
  const nextBlockRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const gestureRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const handsManagerRef = useRef<HandGestureManager | null>(null);
  const tetrisGameRef = useRef<TetrisGame | null>(null);
  const lastMoveTime = useRef({ right: 0, left: 0, rotate: 0, drop: 0 });
  const feedbackTimeoutRef = useRef<number | null>(null);
  const lastGestureRef = useRef<string | null>(null);
  const previousLinesClearedRef = useRef(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const isSub = useRef(false);
  const isSubTemp = useRef(false);
  const [isDangerous, setIsDangerous] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(true);
  const prevIsDangerousRef = useRef(false);
  const [showFirstAttack, setShowFirstAttack] = useState(false);
  const [showFirstAttacked, setShowFirstAttacked] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isNextBlockDonut, setIsNextBlockDonut] = useState(false);
  const [showDonutWarning, setShowDonutWarning] = useState(false);

  const { roomPlayers, isLoading, fetchRoomPlayers } = useFetchRoomPlayers();
  const { subscribeToEntering } = useSubscribeToEntering(
    wsManagerRef,
    setIsOwner,
    setIsAllReady,
    fetchRoomPlayers,
  );

  useEffect(() => {
    const checkDangerousState = () => {
      if (tetrisGameRef.current) {
        const newIsDangerous = tetrisGameRef.current.isDangerous;
        setIsDangerous(newIsDangerous);

        if (newIsDangerous && !prevIsDangerousRef.current) {
          playSoundEffect("/sound/warning.mp3");
        }

        prevIsDangerousRef.current = newIsDangerous;
      }
    };

    const intervalId = setInterval(checkDangerousState, 300);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchRoomPlayers();
  }, [fetchRoomPlayers]);

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
      if (!wsManagerRef.current) {
        wsManagerRef.current = new WebSocketManager();
        try {
          await wsManagerRef.current.connect(
            "https://api.checkmatejungle.shop/ws",
          );
          subscribeToEntering(roomCode);
        } catch (error) {
          console.error("Failed to connect to WebSocket", error);
        }
      }
    };
    connectWebSocket();
  });

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
      }, 7000000); //NOTE - 자동 대기 방으로 이동하지 않도록 큰 수를 넣음

      return () => clearTimeout(timeoutId);
    }
  }, [gameResult]);

  const subscribeToState = async () => {
    const roomCode = getRoomCode();
    if (wsManagerRef.current && isOwner != null) {
      if (!isSubTemp.current) {
        wsManagerRef.current.subscribe(
          `/topic/state/${roomCode}`,
          (message: { isReady: boolean; isStart: boolean }) => {
            setIsAllReady(message.isReady);
            setIsReady(message.isReady);
            if (message.isStart && !isStart) {
              setIsStart(true);
              startGame();
            }
          },
        );
        isSubTemp.current = true;
      }
    }
  };

  const handlePlayAgain = () => {
    setShowResultModal(false);
    setGameResult(null);
    setIsStart(false);
    setIsAllReady(false);
    setLinesCleared(0);
    setIsDangerous(false);
    setGauge(0);
    if (tetrisGameRef.current) {
      tetrisGameRef.current.linesCleared = 0;
      tetrisGameRef.current.isDangerous = false;
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
    handleReadyToggle();
  };

  const handleReadyToggle = () => {
    if (!isOwner) {
      handleReadyClick();
      playSoundEffect("/sound/ready.mp3");
    }
  };

  const handleReadyClick = async () => {
    const roomCode = getRoomCode();
    setIsReady(prevState => {
      const newState = !prevState;
      wsManagerRef.current?.sendMessageOnWaiting(
        {
          isAllReady: newState,
          isStart: false,
        },
        `/topic/state/${roomCode}`,
      );
      return newState;
    });
  };

  const handleStartGameClick = async () => {
    if (isOwner && isAllReady) {
      const roomCode = getRoomCode();
      try {
        wsManagerRef.current?.sendMessageForStart(
          {
            isAllReady: true,
            isStart: true,
          },
          `/app/${roomCode}/tetris/start`,
        );
        playSoundEffect("/sound/start.mp3");
      } catch (error) {
        console.error("Failed to send message to start the game", error);
      }
    }
  };

  const startGame = async () => {
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
                          playOppTetrisElement.classList.remove(
                            "flipped-canvas",
                          );
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

  useEffect(() => {
    if (tetrisGameRef.current) {
      const currentLinesCleared = tetrisGameRef.current.linesCleared;
      const linesClearedDiff =
        currentLinesCleared - previousLinesClearedRef.current;
      if (linesClearedDiff > 0) {
        let newGauge = gauge + linesClearedDiff;
        if (newGauge >= 4) {
          newGauge = 3;
        }
        setGauge(newGauge);
        if (newGauge == 1 && tetrisGameRef.current) {
          tetrisGameRef.current.isAddAttack = true;
          tetrisGameRef.current.isAddAttackToggleOn = true;
        } else if (newGauge == 2 && tetrisGameRef.current) {
          tetrisGameRef.current.isFlipAttack = true;
        } else if (newGauge == 3 && tetrisGameRef.current) {
          tetrisGameRef.current.isDonutAttack = true;
        }

        if (newGauge === 3 && tetrisGameRef.current.linesCleared > 0) {
          setTimeout(() => {
            setGauge(0);
          }, 1000);
        }

        if (!tetrisGameRef.current.isDonutAttack && newGauge === 3) {
          tetrisGameRef.current.isDonutAttack = true;
        }
      }
      previousLinesClearedRef.current = currentLinesCleared;
    }
  }, [linesCleared, gauge]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (tetrisGameRef.current) {
        setLinesCleared(tetrisGameRef.current.linesCleared);
        drawNextBlock(
          tetrisGameRef.current.getNextBlock(),
          nextBlockRef.current,
          tetrisGameRef.current,
        );
        tetrisGameRef.current.isDonutAttack = false;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);
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
  const handleGesture = useHandleGesture({
    tetrisGameRef,
    lastMoveTime,
    triggerGestureFeedback,
    lastGestureRef,
  });

  const onResults = useCallback(
    (results: HandLandmarkResults & { bothHandsDetected: boolean }) => {
      setIsHandDetected(results.bothHandsDetected);

      if (borderRef.current) {
        borderRef.current.style.boxShadow = results.bothHandsDetected
          ? "none"
          : "0 0 20px 20px red";
      }
    },
    [handleGesture],
  );

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
  useEffect(() => {
    if (tetrisGameRef.current) {
      const nextBlock = tetrisGameRef.current.getNextBlock();
      const isDonut = nextBlock.color === "pink";
      setIsNextBlockDonut(isDonut);
      if (isDonut) {
        setShowDonutWarning(true);
        setTimeout(() => setShowDonutWarning(false), 3000);
      }
      drawNextBlock(
        tetrisGameRef.current.getNextBlock(),
        nextBlockRef.current,
        tetrisGameRef.current,
      );
    }
  }, [tetrisGameRef.current?.getNextBlock()]);

  useEffect(() => {
    if (showFirstAttack) {
      const confetti = document.createElement("div");
      if (confettiRef.current) {
        confettiRef.current.appendChild(confetti);
      }
      if (tetrisGameRef.current) {
        tetrisGameRef.current.toggleAttackEffect = false;
      }

      return () => {
        if (confettiRef.current && tetrisGameRef.current) {
          confettiRef.current?.removeChild(confetti);
          tetrisGameRef.current.toggleAttackEffect = false;
        }
      };
    }
  });
  useEffect(() => {
    if (showFirstAttacked) {
      const confetti = document.createElement("div");
      if (confettiRef.current) {
        confettiRef.current.appendChild(confetti);
      }
      if (tetrisGameRef.current) {
        tetrisGameRef.current.toggleAttackedEffect = false;
      }

      return () => {
        if (confettiRef.current && tetrisGameRef.current) {
          confettiRef.current?.removeChild(confetti);
          tetrisGameRef.current.toggleAttackedEffect = false;
        }
      };
    }
  });

  const toggleShowFirstAttack = useCallback(() => {
    setShowFirstAttack(true);
    setTimeout(() => setShowFirstAttack(false), 500);
  }, []);

  useEffect(() => {
    if (tetrisGameRef.current?.toggleAttackEffect) {
      toggleShowFirstAttack();
    }
  });

  const toggleShowFirstAttacked = useCallback(() => {
    setShowFirstAttacked(true);
    setTimeout(() => setShowFirstAttacked(false), 500);
  }, []);

  useEffect(() => {
    if (tetrisGameRef.current?.toggleAttackedEffect) {
      tetrisGameRef.current.toggleAttackedEffect = false;
      toggleShowFirstAttacked();
    }
  });

  return (
    <div className="relative">
      <AnimatePresence>
        {showWaitingModal && (
          <WaitingModal
            isOpen={showWaitingModal}
            wsManager={wsManagerRef.current!}
            isLoading={isLoading}
            onClose={() => setShowWaitingModal(false)}
            isOwner={isOwner}
            isAllReady={isAllReady}
            players={roomPlayers}
            isReady={isReady}
            onReadyToggle={handleReadyToggle}
            onStartGame={handleStartGameClick}
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
          <div className="bg-gradient-to-r from-[#040F2D] via-[#0A1940] to-[#040F2D] py-4 px-8 border-4 border-t-0 border-green-400 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500 opacity-5 animate-pulse"></div>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center flex-1 justify-start gap-6">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-green-400 rounded-full opacity-75 group-hover:opacity-100 transition duration-300 blur-sm"></div>
                  <Image
                    src={
                      roomPlayers[0]?.profileImageUrl || "/image/profile_1.jpeg"
                    }
                    width={70}
                    height={70}
                    alt="Player 1"
                    className="rounded-full border-2 border-white relative"
                  />
                </div>
                <div className="pixel text-4xl text-white font-bold hover:text-green-400 transition duration-300">
                  {roomPlayers[0]?.nickname || "CHOCO"}
                </div>
              </div>
              <h1 className="pixel text-6xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-400 to-green-500 text-transparent bg-clip-text animate-pulse">
                VS
              </h1>
              <div className="flex items-center flex-1 justify-end gap-6">
                <div className="pixel text-4xl text-white font-bold hover:text-green-400 transition duration-300">
                  {roomPlayers[1]?.nickname || "LUCKY UNICORN"}
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-green-400 rounded-full opacity-75 group-hover:opacity-100 transition duration-300 blur-sm"></div>
                  <Image
                    src={
                      roomPlayers[1]?.profileImageUrl || "/image/profile_1.jpeg"
                    }
                    width={70}
                    height={70}
                    alt="Player 2"
                    className="rounded-full border-2 border-white relative"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-around relative pt-8">
            <div className="modal-container absolute inset-0 z-50 flex items-center justify-center"></div>
            <div className="">
              <div className="flex justify-center">
                <div className="relative flex w-[100px] z-30 flex-col-reverse">
                  <ArrowUpNarrowWide
                    className={`border-2 absolute text-white rounded-lg ${
                      gauge === 1 && tetrisGameRef.current?.isAddAttackToggleOn
                        ? "bg-indigo-400"
                        : "bg-black"
                    } w-[40px] h-[40px]`}
                    style={{
                      left: "90%",
                      bottom: `${(1 / 3) * 100}%`,
                      transform: "translateX(0%) translateY(50%)",
                    }}
                  />
                  <FlipVertical2
                    className={`absolute border-2 text-white rounded-lg ${
                      tetrisGameRef.current?.isFlipAttackToggleOn
                        ? "bg-yellow-500"
                        : "bg-black"
                    } w-[40px] h-[40px]`}
                    style={{
                      left: "90%",
                      bottom: `${(2 / 3) * 100}%`,
                      transform: "translateX(0%) translateY(50%)",
                    }}
                  />
                  <Donut
                    className={`absolute border-2 text-white rounded-lg ${
                      tetrisGameRef.current?.isDonutAttackToggleOn && gauge == 3
                        ? "bg-pink-500"
                        : " bg-black"
                    } w-[40px] h-[40px]`}
                    style={{
                      left: "90%",
                      bottom: `${(2.95 / 3) * 100}%`,
                      transform: "translateX(0%) translateY(50%)",
                    }}
                  />
                </div>
                <div className="relative flex z-10 w-[30px] flex-col-reverse border-2">
                  <div
                    className="transition-all duration-700 ease-in-out"
                    style={{
                      height: `${(gauge / 3) * 100}%`,
                      background: "linear-gradient(to top, green, lightgreen)",
                    }}
                  ></div>
                </div>
                <div
                  id="tetris-container"
                  className={`flex flex-col justify-between relative ${
                    isDangerous ? "danger-state" : ""
                  }`}
                >
                  {isDangerous && (
                    <div className="absolute top-0 left-0 right-0 z-10 bg-red-600 opacity-40 text-white text-center py-[2px] pixel animate-pulse">
                      DANGER!
                    </div>
                  )}
                  {isFlipping && (
                    <div className="absolute inset-0 bg-blue-500 opacity-15 z-10 flex items-center justify-center">
                      <span className="text-4xl pixel font-bold text-white shadow-text flip-text">
                        FLIP!
                      </span>
                    </div>
                  )}
                  {showDonutWarning && (
                    <div className="absolute top-8 left-0 right-0 z-10 bg-pink-600 opacity-40 text-white text-center py-[2px] pixel animate-pulse">
                      DONUT INCOMING!
                    </div>
                  )}
                  <div className={`${TETRIS_CANVAS}`}>
                    <canvas
                      ref={canvasTetrisRef}
                      id="tetris"
                      width="300"
                      height="600"
                    />
                  </div>
                  {showFirstAttacked && (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <ConfettiExplosion
                            force={0.25}
                            duration={1300}
                            particleCount={25}
                            particleSize={7}
                            colors={[
                              "#c91212",
                              "#ec9898",
                              "#f4d4d4",
                              "#910909",
                            ]}
                            width={400}
                            height={"-30px"}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {!isHandDetected && (
                    <div className="absolute inset-0 z-30 bg-black bg-opacity-70 flex items-center justify-center">
                      <div className="text-yellow-400 text-4xl font-bold pixel animate-pulse text-center">
                        HANDS NOT DETECTED!
                        <br />
                        <span className="text-2xl">Please show your hands</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between">
                  <div className="flex flex-cols-2 gap-[50px]">
                    <div
                      className={`flex h-[150px] w-[150px] flex-col border-4 border-t-0 relative ${
                        isNextBlockDonut ? "border-pink-400 animate-pulse" : ""
                      }`}
                    >
                      <div
                        className={`press text-center pixel text-2xl ${
                          isNextBlockDonut
                            ? "bg-pink-400 text-white font-bold animate-pulse"
                            : "text-black bg-white"
                        }`}
                      >
                        {isNextBlockDonut ? "DONUT!" : "NEXT"}
                      </div>
                      <canvas
                        ref={nextBlockRef}
                        width="150"
                        height="150"
                        className={`w-full h-full ${
                          isNextBlockDonut ? "animate-pulse" : ""
                        }`}
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
                  <div
                    className={`flex h-[300px] w-[350px] flex-col border-4 border-t-0 ${
                      !isHandDetected ? "border-yellow-400 hand-warning" : ""
                    }`}
                  >
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
                        />
                      </div>
                      <div className="absolute inset-0"></div>
                    </div>
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
                {showFirstAttack && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <ConfettiExplosion
                          force={0.25}
                          duration={1300}
                          particleCount={25}
                          particleSize={7}
                          colors={["#c8c8c8", "#e3e1e1", "#f7f7f7", "#878787"]}
                          width={400}
                          height={"-30px"}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
            <div className="mb-[100px] ml-[70px] mr-[70px]">
              <div className="flex h-[200px] w-[350px] flex-col border-4 border-t-0">
                <div className="press bg-white text-center text-2xl text-black">
                  ATTACK CMD
                </div>
                <div className="flex justify-center gap-8 text-[40px] columns-2 mt-8 p-2 text-white">
                  <FlipVertical2
                    className={`${
                      tetrisGameRef.current?.isFlipAttackToggleOn
                        ? "bg-yellow-400"
                        : "bg-black"
                    } border-4 p-2 rounded-xl text-white w-[105px] h-[105px] transition-all duration-700 ease-in-out`}
                  />
                  <Donut
                    className={`${
                      tetrisGameRef.current?.isDonutAttackToggleOn
                        ? "bg-pink-500"
                        : "bg-black"
                    } border-4 p-2 rounded-xl text-white w-[105px] h-[105px] transition-all duration-700 ease-in-out`}
                  />
                </div>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {showResultModal && (
              <GameResultModal
                result={gameResult === "you WIN!" ? "WIN" : "LOSE"}
                wsManager={wsManagerRef.current!}
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
