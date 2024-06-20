import { Room } from "@/types";
import RoomCard from "./RoomCard";

type Props = {
  rooms: Room[];
};

function RoomGrid({ rooms = [] }: Props) {
  return (
    <ul className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-6">
      {rooms.map((room, index) => (
        <li key={index} className="w-full ">
          <RoomCard room={room} />
        </li>
      ))}
    </ul>
  );
}

export default RoomGrid;
