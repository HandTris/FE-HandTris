import dynamic from "next/dynamic";
import React from "react";

const GameComponents = dynamic(() => import("@/components/TetrisPlay"), {
  ssr: false,
});

function PlayTetrisPage() {
  return (
    <div className="h-full">
      <GameComponents />
    </div>
  );
}

export default PlayTetrisPage;
