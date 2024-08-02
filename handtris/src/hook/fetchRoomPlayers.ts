import { useState, useCallback } from "react";
import { getRoomCode } from "@/util/getRoomCode";
import { searchRoomPlayer } from "@/services/gameService";
import { Player } from "@/components/WaitingModal";

const useFetchRoomPlayers = () => {
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
        }
      }
    } catch (error) {
      console.error("Failed to fetch room players:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { roomPlayers, isLoading, fetchRoomPlayers };
};

export default useFetchRoomPlayers;
