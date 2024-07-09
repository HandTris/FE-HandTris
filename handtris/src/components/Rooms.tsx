"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Room } from "@/types/Room";
import { enterRoom, fetchRooms } from "@/services/gameService";
import { useRouter } from "next/navigation";
import CreateRoomModal from "./CreateRoomModal";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import BannerCarousel from "./BannerCarousel";
import { AnimatePresence, motion } from "framer-motion";

function Rooms() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLeaving, setIsLeaving] = useState(false);
  const roomsPerPage = 9;

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["game_room"],
    queryFn: fetchRooms,
  });

  const sortedRooms = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => b.id - a.id);
  }, [data]);

  const enterRoomMutation = useMutation({
    mutationFn: enterRoom,
    onSuccess: data => {
      sessionStorage.setItem("roomCode", data.data.roomCode);
      sessionStorage.setItem("roomName", data.data.title);
      setIsLeaving(true);
      router.push("/play/tetris");
    },
    onError: error => {
      console.error("Failed to enter room:", error);
    },
  });

  if (isLoading || isFetching) return <p>Loading...</p>;
  if (error) return <p>Error loading rooms</p>;

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = sortedRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="flex flex-col container mx-auto gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-center text-2xl font-bold text-white">
          Game Lobby
        </h1>
        <BannerCarousel />
        <div className="flex justify-between">
          <CreateRoomModal onSuccess={refetch} onClose={refetch} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentRooms.map((room: Room) => (
            <Card
              key={room.id}
              className="group bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-green-500/50 hover:scale-105"
            >
              <div className="flex items-stretch p-4 pr-2 py-2 h-24">
                <div className="flex flex-col items-stretch flex-[6] pr-4">
                  <CardTitle className="text-2xl text-white group-hover:text-green-400 truncate mb-3">
                    {room.title}
                  </CardTitle>
                  <div className="flex justify-between items-center text-lg text-gray-400 mb-2">
                    <div className="flex items-center">
                      <span className="font-semibold text-green-400 mr-2">
                        Host:
                      </span>
                      <span className="truncate max-w-[120px]">
                        {room.creator}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-green-400" />
                      <span>
                        {room.participantCount}/{room.participantLimit}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-[2] flex items-center justify-center ml-4 h-full">
                  <Button
                    className="bg-green-500 text-white hover:bg-green-600 text-lg py-2 px-4 w-full h-full"
                    onClick={() => enterRoomMutation.mutate(room.roomCode)}
                  >
                    {"JOIN"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastRoom >= (data?.data.length || 0)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Rooms;
