export function BoardDesc({ type, desc }: { type: string; desc: number }) {
  return (
    <>
      <h1 className="text-start text-2xl">{type}</h1>
      <h1 className="text-3xl text-center">{desc}</h1>
    </>
  );
}
