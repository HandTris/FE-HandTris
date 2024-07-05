"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Room } from "@/types/Room";

type Props = {
  rooms: Room[];
};

function RoomGrid({ rooms = [] }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateRoom = (newRoom: Room) => {
    rooms.push(newRoom);
    setCurrentRoom(newRoom);
    setIsCreateModalOpen(false);
    setIsWaitingModalOpen(true);
  };

  const handleCloseWaitingModal = () => {
    setIsWaitingModalOpen(false);
  };

  return (
    <div className="w-full px-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-400">Rooms</h1>
        <button
          onClick={handleOpenCreateModal}
          className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
        >
          방 만들기
        </button>
      </div>
      <ul className="grid w-full gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, index) => (
          <li key={index} className="w-full">
            {/* <RoomCard room={room} /> */}
          </li>
        ))}
      </ul>
      <AnimatePresence></AnimatePresence>
    </div>
  );
}

export default RoomGrid;
