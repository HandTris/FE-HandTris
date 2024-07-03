import { fetchWithAuth } from "./fetchWithAuth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const fetchRooms = async () => {
    const data = await fetchWithAuth(`${BASE_URL}/games`);
    return data;
};

export const createRoom = async () => {
    const data = await fetchWithAuth(`${BASE_URL}/games`, {
        method: 'POST',
        body: JSON.stringify({
            gameCategory: "HANDTRIS",
            participantLimit: 2
        })
    });
    return data;
}
export const enterRoom = async (gameUuid: string) => {
    const data = await fetchWithAuth(`${BASE_URL}/games/${gameUuid}/enter`, {
        method: 'POST',
    });
    return data;
};

export const exitRoom = async (gameUuid: string) => {
    const data = await fetchWithAuth(`${BASE_URL}/games/${gameUuid}/exit`, {
        method: 'POST',
    });
    return data;
};
