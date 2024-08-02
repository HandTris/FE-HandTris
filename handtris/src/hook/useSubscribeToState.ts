import { useEffect, useRef } from "react";
import { getRoomCode } from "@/util/getRoomCode";
import { WebSocketManager } from "@/components/WebSocketManager";

const useSubscribeToState = (
  wsManagerRef: React.MutableRefObject<WebSocketManager | null>,
  isOwner: boolean | null,
  setIsAllReady: React.Dispatch<React.SetStateAction<boolean>>,
  setIsReady: React.Dispatch<React.SetStateAction<boolean>>,
  setIsStart: React.Dispatch<React.SetStateAction<boolean>>,
  startGame: () => void,
  isStart: boolean,
) => {
  const isSubTemp = useRef(false);

  useEffect(() => {
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

    if (isOwner != null) {
      subscribeToState();
    }
  }, [
    isOwner,
    wsManagerRef,
    setIsAllReady,
    setIsReady,
    setIsStart,
    startGame,
    isStart,
  ]);
};

export default useSubscribeToState;
