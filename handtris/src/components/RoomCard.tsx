import { Room } from "@/types";

type Props = {
  room: Room;
};

function RoomCard({ room }: Props) {
  return (
    <div className="w-full bg-gray-800 border border-green-600 rounded-lg p-6 m-4 mx-auto transition-transform transform hover:scale-105 hover:brightness-125 hover:shadow-xl">
      <h2 className="text-xl font-bold text-green-400 mb-2">{room.title}</h2>
      <p className="text-sm text-green-300 mb-4">Created by {room.creator}</p>
      <p
        className={`text-lg font-medium ${
          room.playing ? "text-green-500" : "text-red-500"
        }`}
      >
        {room.playing ? "게임 중" : "대기 중"}
      </p>
    </div>
  );
}

export default RoomCard;
