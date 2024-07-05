export const getRoomCode = () => {
  return sessionStorage.getItem("roomCode") || localStorage.getItem("roomCode");
};
