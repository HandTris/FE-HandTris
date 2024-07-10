import { fetchWithAuth } from "./fetchWithAuth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const fetchRooms = async () => {
  const data = await fetchWithAuth(`${BASE_URL}/games`);
  return data;
};

export const createRoom = async ({ title }: { title: string }) => {
  const data = await fetchWithAuth(`${BASE_URL}/games`, {
    method: "POST",
    body: JSON.stringify({
      title,
    }),
  });
  return data;
};
export const enterRoom = async (gameUuid: string) => {
  const data = await fetchWithAuth(`${BASE_URL}/games/${gameUuid}/enter`, {
    method: "POST",
  });
  return data;
};

export const exitRoom = async (gameUuid: string) => {
  const data = await fetchWithAuth(`${BASE_URL}/games/${gameUuid}/exit`, {
    method: "POST",
  });
  return data;
};

export const myStatus = async () => {
  const data = await fetchWithAuth(`${BASE_URL}/records`);
  return data;
};

export const searchStatus = async (nicname: string) => {
  const data = await fetchWithAuth(`${BASE_URL}/records/${nicname}`);
  return data;
};

export const updateStatus = async (status: string) => {
  const data = await fetchWithAuth(`${BASE_URL}/records`, {
    method: "POST",
    body: JSON.stringify({
      gameResult: status,
    }),
  });
  return data;
};

export const searchRoomPlayer = async (gameUuid: string) => {
  const data = await fetchWithAuth(
    `${BASE_URL}/records/participant/${gameUuid}`,
  );
  return data;
};
