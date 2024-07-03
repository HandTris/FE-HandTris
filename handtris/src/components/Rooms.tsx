"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Room } from "@/types/Room";
import { createRoom, enterRoom, fetchRooms } from "@/services/gameService";
import { useRouter } from "next/navigation";

function Rooms() {
  const router = useRouter();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["game"],
    queryFn: fetchRooms,
  });

  const createRoomMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      refetch(); // 방 생성 후 데이터를 다시 가져옴
    },
    onError: (error) => {
      console.error("Failed to create room:", error);
    },
  });

  const enterRoomMutation = useMutation({
    mutationFn: enterRoom,
    onSuccess: (data) => {
      sessionStorage.setItem("room_uuid", data.data.uuid);
      alert(`Entered room with UUID: ${data.data.uuid}`);
      router.push(
        `${process.env.NEXT_PUBLIC_BASE_URL}/game/${
          data.data.uuid.split("-")[3]
        }`
      );
    },
    onError: (error) => {
      console.error("Failed to enter room:", error);
    },
  });

  return (
    <section className="text-white p-5 space-y-5">
      <button
        onClick={() => {
          createRoomMutation.mutate();
        }}
        className="fixed top-5 left-5 p-4 bg-orange-400 text-white"
      >
        생성 임시 버튼
      </button>
      <h1>게임 대기방</h1>
      <ul className="flex flex-col gap-4 pixel">
        {data?.data.map((room: Room) => (
          <li
            onClick={() => {
              enterRoomMutation.mutate(room.uuid);
            }}
            key={room.id}
            className="border-4 border-dotted p-4"
          >
            <h3>{room.uuid.split("-")[3]}</h3>
            <h2 className=" text-3xl">{room.gameCategory}</h2>
            <p className="text-xl">
              <span className="text-2xl text-green-400">Participants </span>
              {room.participantCount}/{room.participantLimit}
            </p>
            <p>Status: {room.gameStatus}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Rooms;
