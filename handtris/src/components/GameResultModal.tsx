import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { myStatus } from "@/services/gameService";
import { createPortal } from "react-dom";
import {
  Trophy,
  Frown,
  BarChart2,
  ArrowUp,
  ArrowDown,
  Swords,
} from "lucide-react";
import CountUp from "react-countup";
import { getRoomCode } from "@/util/getRoomCode";
import { WebSocketManager } from "./WebSocketManager";
interface GameResultModalProps {
  result: "WIN" | "LOSE";
  onPlayAgain: () => void;
  linesCleared: number;
  wsManager: WebSocketManager;
}

interface PlayerStats {
  win: number;
  lose: number;
  winRate: number;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  result,
  onPlayAgain,
  wsManager,
}) => {
  const router = useRouter();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [prevWinRate, setPrevWinRate] = useState<number | null>(null);

  const handleBackToLobby = () => {
    const roomCode = getRoomCode();
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

    router.push("/lobby?refresh=true");
  };
  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const response = await myStatus();
        if (response.data) {
          const currentStats = response.data;
          setPrevWinRate(currentStats.winRate);
          const updatedStats = {
            win: currentStats.win + (result === "WIN" ? 1 : 0),
            lose: currentStats.lose + (result === "LOSE" ? 1 : 0),
            winRate: 0,
          };
          updatedStats.winRate = Number(
            (
              (updatedStats.win / (updatedStats.win + updatedStats.lose)) *
              100
            ).toFixed(2),
          );
          setPlayerStats(updatedStats);
        }
      } catch (error) {
        console.error("Failed to fetch player stats:", error);
      }
    };

    fetchPlayerStats();
  }, [result]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-3xl text-center shadow-2xl max-w-md w-full border-2 border-gray-700">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {result === "WIN" ? (
            <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-4" />
          ) : (
            <Frown className="w-24 h-24 mx-auto text-red-400 mb-4" />
          )}
          <h2
            className={`text-6xl font-bold mb-8 ${
              result === "WIN" ? "text-yellow-400" : "text-red-400"
            }`}
          >
            {result === "WIN" ? "YOU WIN!" : "YOU LOSE!"}
          </h2>
        </motion.div>
        {playerStats && (
          <div className="space-y-6 mb-8">
            <motion.div
              className="bg-gray-800 p-6 rounded-2xl shadow-inner border border-gray-700"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center mb-2">
                <BarChart2 className="w-8 h-8 mr-3 text-blue-400" />
                <p className="text-2xl text-gray-300">Win Rate</p>
              </div>
              <div className="text-7xl font-bold flex items-center justify-center">
                <span
                  className={
                    result === "WIN" ? "text-green-400" : "text-red-400"
                  }
                >
                  <CountUp
                    start={prevWinRate || 0}
                    end={playerStats.winRate}
                    duration={2}
                    decimals={2}
                    suffix="%"
                  />
                </span>
                {prevWinRate !== null &&
                  prevWinRate !== playerStats.winRate && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 2,
                        type: "spring",
                        stiffness: 500,
                        damping: 10,
                      }}
                      className={`ml-3 ${
                        result === "WIN" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {result === "WIN" ? (
                        <ArrowUp className="w-10 h-10" />
                      ) : (
                        <ArrowDown className="w-10 h-10" />
                      )}
                    </motion.div>
                  )}
              </div>
            </motion.div>
            <motion.div
              className="bg-gray-800 p-4 rounded-2xl shadow-inner border border-gray-700"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-center mb-2">
                <Swords className="w-6 h-6 mr-2 text-purple-400" />
                <p className="text-xl text-gray-300">Match History</p>
              </div>
              <p className="text-3xl font-bold text-white">
                <span className="text-green-400">{playerStats.win}W</span> -{" "}
                <span className="text-red-400">{playerStats.lose}L</span>
              </p>
            </motion.div>
          </div>
        )}
        <div className="flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full transition focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 text-lg font-semibold"
          >
            Play Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToLobby}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-lg font-semibold"
          >
            Back to Lobby
          </motion.button>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
};

export default GameResultModal;
