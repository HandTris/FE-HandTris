import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface GameResultModalProps {
  result: "WIN" | "LOSE";
  onPlayAgain: () => void;
  linesCleared: number;
  time: number;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  result,
  onPlayAgain,
  linesCleared,
  time,
}) => {
  const router = useRouter();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
    >
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-10 rounded-xl text-center shadow-2xl max-w-md w-full">
        <h2
          className={`text-6xl font-bold mb-8 ${result === "WIN" ? "text-green-400" : "text-red-400"}`}
        >
          {result === "WIN" ? "YOU WIN!" : "YOU LOSE!"}
        </h2>
        <div className="space-y-4 mb-8">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-xl text-gray-300 mb-2">Lines Cleared</p>
            <p className="text-4xl font-bold text-white">{linesCleared}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-xl text-gray-300 mb-2">Time</p>
            <p className="text-4xl font-bold text-white">{formatTime(time)}</p>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onPlayAgain}
            className="px-8 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push("/lobby")}
            className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameResultModal;
