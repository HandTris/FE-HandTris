"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { UserCard } from "./UserCard";

interface WaitingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const WaitingModal = ({ isOpen, onClose, isLoading }) => {
  const user1 = {
    image: "/image/profile_1.jpeg",
    name: "USER1",
    winrate: "20%",
    stats: "1/5",
  };

  const user2 = {
    image: "/image/profile_2.jpeg",
    name: "USER2",
    winrate: "30%",
    stats: "2/5",
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        id="modal"
        className="relative rounded-lg border-4 border-green-600 bg-gradient-to-b from-gray-900 to-black shadow-2xl"
      >
        <div className="relative z-10 p-8 text-white">
          <div className="flex h-full items-center justify-around">
            <UserCard
              isLoading={isLoading}
              bgColorFrom="from-gray-800"
              bgColorTo="to-purple-700"
              borderColor="border-purple-600"
              user={user1}
            />
            <div className="mx-8 text-6xl font-extrabold text-white drop-shadow-lg">
              VS
            </div>
            <UserCard
              isLoading={!isLoading}
              bgColorFrom="from-gray-800"
              bgColorTo="to-yellow-700"
              borderColor="border-yellow-600"
              user={user2}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default WaitingModal;
