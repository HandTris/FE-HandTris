export const getRoomCode = (): string | null => {
  return sessionStorage.getItem("roomCode") || null;
};

export const getRoomName = (): string | null => {
  return sessionStorage.getItem("roomName") || null;
};
