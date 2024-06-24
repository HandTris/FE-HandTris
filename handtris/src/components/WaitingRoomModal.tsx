import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WebSocketManager } from "@/components/WebSocketManager";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  username: string;
  wsManager: WebSocketManager;
};

const modalVariants = {
  hidden: { opacity: 0, y: "-50%" },
  visible: { opacity: 1, y: "0%" },
};

function WaitingRoom({ isOpen, onClose, roomId, username, wsManager }: Props) {
  const [opponent, setOpponent] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  useEffect(() => {
    if (wsManager.connected) {
      wsManager.joinRoom(roomId, username);
    }

    wsManager.onMessage = (message: any) => {
      if (message.type === "JOIN") {
        setOpponent(message.username);
      } else if (message.type === "READY") {
        if (message.username !== username) {
          setOpponentReady(true);
        }
      } else if (message.type === "START") {
        onClose();
        // Here you can trigger the start of the game
      }
    };
  }, [wsManager, roomId, username, onClose]);

  const handleReady = () => {
    setReady(true);
    wsManager.ready(roomId, username);
  };

  const handleStartGame = () => {
    wsManager.startGame(roomId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        className="bg-gray-800 p-6 rounded-lg w-1/3 flex flex-col items-center"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={modalVariants}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-green-400 mb-4">대기실</h2>
        <div className="flex items-center w-full mb-4">
          <img
            src="/path/to/profile-pic.jpg"
            alt="Profile"
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
        <button
          onClick={onClose}
          className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 mt-4"
        >
          방 나가기
        </button>
      </motion.div>
    </div>
  );
}

export default WaitingRoom;
