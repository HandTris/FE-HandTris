"use client";
import { useState } from "react";
import { Room } from "@/types";
import RoomCard from "./RoomCard";
import CreateRoomModal from "./CreateRoomModal";
import { AnimatePresence } from "framer-motion";

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-400">Rooms</h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
        >
          방 만들기
        </button>
      </div>
      <ul className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rooms.map((room, index) => (
          <li key={index} className="w-full">
            <RoomCard room={room} />
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateRoomModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onCreateRoom={handleCreateRoom}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default RoomGrid;