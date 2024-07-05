"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Room } from "@/types/Room";
import { enterRoom, fetchRooms } from "@/services/gameService";
import { useRouter } from "next/navigation";
import { DrawerDemo } from "@/hook/useDrawer";
import { ClipLoader, BarLoader } from "react-spinners";
import { useState } from "react";
import Image from "next/image";
import CreateRoomModal from "./CreateRoomModal";
import WaitingModal from "./WaitingModal";

function Rooms() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["game_room"],
    queryFn: fetchRooms,
  });

  const enterRoomMutation = useMutation({
    mutationFn: enterRoom,
    onSuccess: data => {
      sessionStorage.setItem("roomCode", data.data.roomCode);
      alert(`Entered room with UUID: ${data.data.roomCode}`);
      // router.push(`/game/${data.data.roomCode.split("-")[3]}`);
      router.push("/play/tetris");
    },
    onError: error => {
      console.error("Failed to enter room:", error);
    },
  });

  if (isLoading || isFetching) return <p>Loading...</p>;
  if (error) return <p>Error loading rooms</p>;

  return (
    <section className="space-y-5 p-5 text-white">
      <CreateRoomModal onSuccess={refetch} onClose={refetch} />
      {/* <DrawerDemo /> */}
      {/* <WaitingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isLoading}
      /> */}
      <h1>게임 대기방</h1>
      <ul className="pixel gap-4">
        {data?.data.map((room: Room) => (
          <li
            onClick={() => {
              enterRoomMutation.mutate(room.roomCode);
            }}
            key={room.id}
            className="border-4 border-dotted p-4"
          >
            <h2 className="text-3xl">{room.title}</h2>
            <h2 className="text-2xl">{room.creator}</h2>
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
