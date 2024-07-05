import Rooms from "@/components/Rooms";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

async function LobbyPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  });

  //   await queryClient.prefetchQuery({
  //     queryKey: ["game_room"],
  //     queryFn: fetchRooms,
  //   });

  // queryClient.removeQueries({
  //   queryKey: ["games"],
  // });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Rooms />
    </HydrationBoundary>
  );
}

export default LobbyPage;
