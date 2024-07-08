export const getRoomCode = (): string | null => {
  return sessionStorage.getItem("roomCode") || localStorage.getItem("roomCode");
};
