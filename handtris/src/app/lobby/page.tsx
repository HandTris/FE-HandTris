import Rooms from "@/components/Rooms";
import { fetchRooms } from "@/services/gameService";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

type Props = {};

async function LobbyPage({}: Props) {
  const queryClient = new QueryClient();

  await queryClient.fetchQuery({
    queryKey: ["game_room"],
    queryFn: fetchRooms,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Rooms />
    </HydrationBoundary>
  );
}

export default LobbyPage;
