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

export function CreateRoomModal({ onSuccess, onClose }: DialogDemoProps) {
  const [title, setTitle] = useState("");
  const router = useRouter();

  const createRoomMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: (data) => {
      onSuccess();
      sessionStorage.setItem("roomCode", data.data.roomCode);
      onClose();
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
    <Dialog onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            {"Make changes to your profile here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Game Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRoomModal;
