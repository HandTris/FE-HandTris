import { Piece, TetrisGame } from "@/components/TetrisGame";

export const drawNextBlock = (
  nextBlock: Piece,
  canvas: HTMLCanvasElement | null,
  tetrisGame: TetrisGame | null,
) => {
  if (canvas && nextBlock && tetrisGame) {
    const context = canvas.getContext("2d");
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      nextBlock.activeTetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            if (nextBlock.color === "orange") {
              tetrisGame.drawSquareCanvas(
                context,
                x + 1.3,
                y + 0.5,
                nextBlock.color,
                false,
              );
            } else if (nextBlock.color === "blue") {
              tetrisGame.drawSquareCanvas(
                context,
                x + 0.5,
                y - 0.1,
                nextBlock.color,
                false,
              );
            } else if (nextBlock.color === "green") {
              tetrisGame.drawSquareCanvas(
                context,
                x + 1.0,
                y + 0.9,
                nextBlock.color,
                false,
              );
            } else if (nextBlock.color === "red") {
              tetrisGame.drawSquareCanvas(
                context,
                x + 1.0,
                y + 1.0,
                nextBlock.color,
                false,
              );
            } else if (nextBlock.color === "yellow") {
              tetrisGame.drawSquareCanvas(
                context,
                x + 1.0,
                y + 0.8,
                nextBlock.color,
                false,
              );
            } else if (nextBlock.color === "pink") {
              tetrisGame.drawSquareCanvas(
                context,
                x + 1.05,
                y + 0.45,
                nextBlock.color,
                false,
              );
            } else {
              tetrisGame.drawSquareCanvas(
                context,
                x + 0.5,
                y + 0.5,
                nextBlock.color,
                false,
              );
            }
          }
        });
      });
    }
  }
};
