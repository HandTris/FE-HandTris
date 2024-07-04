export const getRoomCode = () => {
    return sessionStorage.getItem("room_roomCode") || localStorage.getItem("room_roomCode");
};