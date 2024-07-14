"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Room } from "@/types/Room";
import { enterRoom, fetchRooms } from "@/services/gameService";
import { useRouter } from "next/navigation";
import CreateRoomModal from "./CreateRoomModal";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BannerCarousel from "./BannerCarousel";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "./ui/use-toast";
import { menuClickSound, menuHoverSound } from "@/hook/howl";

function Rooms() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 9;

  const {
    data: roomsData,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["game_room"],
    queryFn: fetchRooms,
  });
  useEffect(() => {
    refetch();
  }, []);

  const sortedRooms = useMemo(() => {
    if (!roomsData?.data) return [];
    return [...roomsData.data].reverse();
  }, [roomsData]);

  const enterRoomMutation = useMutation({
    mutationFn: enterRoom,
    onSuccess: data => {
      sessionStorage.setItem("roomCode", data.data.roomCode);
      sessionStorage.setItem("roomName", data.data.title);
      router.push("/play/tetris");
    },
    onError: error => {
      toast({
        title: "방 입장 실패!",
        description: "방에 입장하지 못했습니다",
        duration: 2000,
        className: "toast-error",
      });
      refetch();
      console.error("Failed to enter room:", error);
    },
  });

  if (isLoading || isFetching) return <p>Loading...</p>;
  if (error) return <p>Error loading rooms</p>;

  const totalRooms = roomsData?.data.length || 0;
  const totalPages = Math.ceil(totalRooms / roomsPerPage);

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = sortedRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="flex flex-col container mx-auto gap-4 pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BannerCarousel />
        <div className="flex justify-between">
          <Button
            onMouseEnter={menuHoverSound}
            onClick={() => {
              menuClickSound();
              refetch();
              toast({
                title: "방 새로고침!",
                description: "방 새로고침이 완료되었습니다",
                duration: 2000,
                className: "toast-success",
              });
            }}
            variant="secondary"
            className="bg-gray-800 p-6 border-2 border-white text-xl text-white hover:border-green-500 hover:text-green-500 hover:bg-gray-800 hover:scale-105 transition-all duration-200 ease-in-out
          shadow-lg hover:shadow-md hover:shadow-green-500/50
          "
          >
            방 새로고침
          </Button>
          <CreateRoomModal onClose={refetch} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentRooms.map((room: Room) => (
            <Card
              key={room.roomCode}
              onMouseEnter={menuHoverSound}
              className="group bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-green-500/50 hover:scale-105"
            >
              <div className="flex items-stretch p-4 h-24">
                <div className="flex flex-col justify-between flex-grow overflow-hidden pr-4">
                  <CardTitle className="text-xl text-white group-hover:text-green-400 truncate">
                    {room.title}
                  </CardTitle>
                  <div className="flex flex-col justify-end">
                    <div className="flex items-center overflow-hidden text-xl text-gray-400">
                      <span className="font-semibold text-green-400 mr-2 whitespace-nowrap">
                        Host:
                      </span>
                      <span className="truncate max-w-[120px]">
                        {room.creator}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 w-24 flex items-center justify-center ml-2">
                  <Button
                    className="bg-green-500 text-white hover:bg-green-600 text-base py-2 px-4 w-full h-16"
                    onClick={() => {
                      menuClickSound();
                      enterRoomMutation.mutate(room.roomCode);
                    }}
                  >
                    JOIN
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Rooms;
