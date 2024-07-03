type Props = {
  params: {
    room_id: string;
  };
};

function PlayGamePage({ params: { room_id } }: Props) {
  console.log(room_id);
  return (
    <div className="flex flex-col p-4 text-white">
      <h1 className="text-4xl">{room_id}</h1>
    </div>
  );
}

export default PlayGamePage;
