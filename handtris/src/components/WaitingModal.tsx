import * as React from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { UserCard } from "./UserCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getRoomName } from "@/util/getRoomCode";
import { useRouter } from "next/navigation";
import { WebSocketManager } from "./WebSocketManager";
import { menuClickSound, menuHoverSound } from "@/hook/howl";

export interface Player {
  nickname: string;
  profileImageUrl: string;
  win: number;
  lose: number;
  winRate: number;
}

interface WaitingModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onReadyToggle: () => void;
  onStartGame: () => void;
  isOwner: boolean | null;
  isAllReady: boolean;
  isReady: boolean;
  wsManager: WebSocketManager;
  players: Player[];
}

const WaitingModal = ({
  isOpen,
  onClose,
  onReadyToggle,
  onStartGame,
  isOwner,
  isAllReady,
  isReady,
  players = [],
  wsManager,
}: WaitingModalProps) => {
  const router = useRouter();
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  if (!isOpen) return null;

  const getButtonText = () => {
    if (isOwner) {
      if (players.length < 2) return "대기 중...";
      if (isAllReady) return "Game Start";
      return "상대방 준비 대기 중...";
    }
    return isReady ? "Cancel Ready" : "Ready";
  };

  const isButtonDisabled =
    players.length < 2 || (isButtonClicked && getButtonText() === "Game Start");

  const handleButtonClick = () => {
    if (getButtonText() === "Game Start") {
      setIsButtonClicked(true);
      onStartGame();
    } else {
      onReadyToggle();
    }
  };

  const handleBackToLobby = () => {
    const roomCode = sessionStorage.getItem("roomCode");
    if (roomCode && wsManager && wsManager.connected) {
      wsManager.sendMessageOnDisconnecting(
        {},
        `/app/${roomCode}/disconnect`,
        false,
      );
      wsManager.disconnect();
    }
    sessionStorage.removeItem("roomCode");
    sessionStorage.removeItem("roomName");
    menuClickSound();
    router.push("/lobby");
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            x: ["0%", "-5%", "5%", "-5%", "5%", "0%"],
            y: "100%",
            transition: {
              duration: 0.8,
              ease: "easeInOut",
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
              x: {
                duration: 0.4,
              },
            },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <div className="absolute top-12 left-12 pixel">
            <button
              onMouseEnter={menuHoverSound}
              onClick={handleBackToLobby}
              className="flex items-center px-6 py-3 text-3xl font-bold text-white bg-gray-800 transition-all duration-300 hover:bg-gray-700 border-4 border-green-500 hover:border-green-400 hover:scale-105 shadow-lg hover:shadow-green-500/50 hover:animate-pulse"
            >
              <ArrowLeft className="mr-3 h-8 w-8" />
              Back to Lobby
            </button>
          </div>
          <button onClick={onClose} className="hidden"></button>
          <div
            id="modal"
            className="relative border-8 border-green-600 bg-gradient-to-b from-gray-900 to-black shadow-2xl"
          >
            <h1
              id="title"
              className="text-black-400 border-b-8 border-green-400 p-4 px-6 pixel text-center text-3xl font-bold tracking-widest animate-pulse bg-gradient-to-r from-green-500 to-white bg-clip-text text-transparent"
            >
              {typeof window !== "undefined" ? getRoomName() : null}
            </h1>
            <div className="relative z-10 p-8 text-white">
              <div className={`flex h-full items-center justify-around`}>
                <UserCard
                  isLoading={false}
                  bgColorFrom="from-gray-800"
                  bgColorTo="to-purple-700"
                  borderColor="border-purple-600"
                  user={players[0] || null}
                />
                <div className="mx-8 text-6xl font-extrabold text-white drop-shadow-lg pixel">
                  <span className="text-purple-500">V</span>
                  <span className="text-yellow-600">S</span>
                </div>
                <UserCard
                  isLoading={players.length === 1}
                  bgColorFrom="from-gray-800"
                  bgColorTo="to-yellow-700"
                  borderColor="border-yellow-600"
                  user={players[1] || null}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleButtonClick}
            className={`mt-4 text-3xl pixel px-6 py-4 text-white rounded-lg transition-colors ${
              isButtonDisabled
                ? "bg-gray-500 cursor-not-allowed"
                : isOwner
                  ? isAllReady
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-yellow-600 cursor-default"
                  : isReady
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isButtonDisabled}
          >
            {getButtonText().toUpperCase()}
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default WaitingModal;
