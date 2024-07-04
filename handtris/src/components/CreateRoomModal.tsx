import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createRoom } from "@/services/gameService";
import { useRouter } from "next/navigation";

type DialogDemoProps = {
  onSuccess: () => void;
  onClose: () => void;
};

function CreateRoomModal({ onSuccess, onClose }: DialogDemoProps) {
  const [title, setTitle] = useState("");
  const router = useRouter();

  const createRoomMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: (data) => {
      sessionStorage.setItem("roomCode", data.data);
      router.push(`/play/tetris`);
    },
    onError: (error) => {
      console.error("Failed to create room:", error);
      alert("Failed to create room");
    },
  });

  const handleSave = () => {
    createRoomMutation.mutate({ title });
  };

  return (
    <Dialog modal={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="text-xl bg-gray-800 text-white hover:bg-gray-700"
        >
          방 만들기
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
        <DialogHeader className="border-b border-gray-700 pb-4 mb-4">
          <DialogTitle className="text-2xl font-semibold">
            방 만들기
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            새로운 게임 방의 제목을 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-gray-300">
              게임 제목
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3 bg-gray-800 text-white border border-gray-700 focus:border-gray-500 focus:ring focus:ring-gray-500 focus:ring-opacity-50"
            />
          </div>
        </div>
        <DialogFooter className="border-t border-gray-700 pt-4 mt-4">
          <Button
            type="button"
            onClick={handleSave}
            className="bg-gray-800 text-white hover:bg-gray-700"
          >
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRoomModal;
