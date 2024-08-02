import { useCallback } from "react";
import { WebSocketManager } from "@/components/WebSocketManager";

const useSubscribeToEntering = (
  wsManagerRef: React.MutableRefObject<WebSocketManager | null>,
  setIsOwner: React.Dispatch<React.SetStateAction<boolean | null>>,
  setIsAllReady: React.Dispatch<React.SetStateAction<boolean>>,
  fetchRoomPlayers: () => Promise<void>,
) => {
  const subscribeToEntering = useCallback(
    (roomCode: string | null) => {
      wsManagerRef.current?.subscribe(
        `/topic/owner/${roomCode}`,
        (message: unknown) => {
          const parsedMessage = message as { isOwner?: boolean };
          if (parsedMessage.isOwner !== undefined) {
            setIsOwner(prevIsOwner => {
              if (prevIsOwner === null) {
                if (parsedMessage.isOwner) {
                  return true;
                } else {
                  fetchRoomPlayers();
                  return false;
                }
              } else if (prevIsOwner === true && !parsedMessage.isOwner) {
                setIsAllReady(false);
                fetchRoomPlayers();
              } else if (prevIsOwner === true && parsedMessage.isOwner) {
                fetchRoomPlayers();
              } else if (prevIsOwner === false && parsedMessage.isOwner) {
                fetchRoomPlayers();
                setIsOwner(true);
                return parsedMessage.isOwner;
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
    [fetchRoomPlayers, setIsAllReady, setIsOwner, wsManagerRef],
  );

  return { subscribeToEntering };
};

export default useSubscribeToEntering;
