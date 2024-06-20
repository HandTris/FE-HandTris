import RoomGrid from "@/components/RoomGrid";

type Props = {};

function LobbyPage({}: Props) {
  return (
    <section>
      <h1>게임 대기방</h1>
      <RoomGrid
        rooms={[
          {
            title: "방 1",
            playing: true,
            creator: "user1",
          },
          {
            title: "방 2",
            playing: false,
            creator: "user2",
          },
          {
            title: "방 3",
            playing: true,
            creator: "user3",
          },
        ]}
      />
    </section>
  );
}

export default LobbyPage;
