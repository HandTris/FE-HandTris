import * as React from "react";
import { createPortal } from "react-dom";
import { UserCard } from "./UserCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getRoomName } from "@/util/getRoomCode";
import { useRouter } from "next/navigation";
import { exitRoom } from "@/services/gameService";
import { WebSocketManager } from "./WebSocketManager";

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
  onReady: () => void;
  isOwner: boolean | null;
  isAllReady: boolean;
  wsManager: WebSocketManager;
  players: Player[];
}

const WaitingModal = ({
  isOpen,
  //   isLoading,
  onClose,
  onReady,
  isOwner,
  isAllReady,
  players = [],
  wsManager,
}: WaitingModalProps) => {
  const router = useRouter();
  if (!isOpen) return null;

  const getButtonText = () => {
    if (isOwner) {
      if (players.length < 2) return "대기 중...";
      if (isAllReady) return "Game Start";
      return "상대방 준비 대기 중...";
    }
    return "Ready";
  };

  const isButtonDisabled = players.length < 2;

  const handleBackToLobby = () => {
    const roomCode = sessionStorage.getItem("roomCode");
    if (roomCode && wsManager && wsManager.connected) {
      wsManager.sendMessageOnDisconnecting(
        {},
        `/app/${roomCode}/disconnect`,
        false, // isStart는 대기실에서 false입니다
      );
    }
    exitRoom(roomCode as string);
    sessionStorage.removeItem("roomCode");
    sessionStorage.removeItem("roomName");

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
            onClick={onReady}
            className={`mt-4 text-3xl pixel px-6 py-4 text-white rounded-lg transition-colors ${
              isButtonDisabled
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
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
