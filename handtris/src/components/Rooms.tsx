"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Room } from "@/types/Room";
import { createRoom, enterRoom, fetchRooms } from "@/services/gameService";
import { useRouter } from "next/navigation";

function Rooms() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["game_room"],
    queryFn: fetchRooms,
  });

  const createRoomMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["game_room"],
      });
    },
    onError: (error) => {
      console.error("Failed to create room:", error);
    },
  });

  const enterRoomMutation = useMutation({
    mutationFn: enterRoom,
    onSuccess: (data) => {
      sessionStorage.setItem("room_roomCode", data.data.roomCode);
      alert(`Entered room with UUID: ${data.data.roomCode}`);
      router.push(`/game/${data.data.roomCode.split("-")[3]}`);
    },
    onError: (error) => {
      console.error("Failed to enter room:", error);
    },
  });

  if (isLoading || isFetching) return <p>Loading...</p>;
  if (error) return <p>Error loading rooms</p>;

  return (
    <section className="text-white p-5 space-y-5">
      <button
        onClick={() => {
          createRoomMutation.mutate({
            title: "Test Room",
          });
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
              enterRoomMutation.mutate(room.roomCode);
            }}
            key={room.id}
            className="border-4 border-dotted p-4"
          >
            {/* <h3>{room.roomCode.split("-")[3]}</h3> */}
            <h2 className=" text-3xl">{room.title}</h2>
            <h2 className=" text-2xl">{room.creator}</h2>
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
