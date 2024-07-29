import { useCallback, MutableRefObject } from "react";
import { TetrisGame } from "@/components/TetrisGame";

interface UseHandleGestureProps {
  tetrisGameRef: MutableRefObject<TetrisGame | null>;
  lastMoveTime: MutableRefObject<{
    right: number;
    left: number;
    rotate: number;
    drop: number;
  }>;
  triggerGestureFeedback: (feedback: string) => void;
  lastGestureRef: MutableRefObject<string | null>;
}

export const useHandleGesture = ({
  tetrisGameRef,
  lastMoveTime,
  triggerGestureFeedback,
  lastGestureRef,
}: UseHandleGestureProps) => {
  const handleGesture = useCallback(
    (gesture: string, handType: string) => {
      const now = Date.now();

      if (handType === "Right") {
        if (gesture === "Pointing Right") {
          if (now - lastMoveTime.current.right < 200) {
            return;
          }
          lastMoveTime.current.right = now;
          tetrisGameRef.current?.p.moveRight();
          triggerGestureFeedback("Move Right");
        } else if (gesture === "Pointing Left") {
          if (now - lastMoveTime.current.left < 200) {
            return;
          }
          lastMoveTime.current.left = now;
          tetrisGameRef.current?.p.moveLeft();
          triggerGestureFeedback("Move Left");
        }
      } else {
        if (gesture == "Pointing Left") {
          console.log("Pointing Left");
          if (now - lastMoveTime.current.rotate < 500) {
            return;
          }
          lastMoveTime.current.rotate = now;
          tetrisGameRef.current?.p.rotate();
          triggerGestureFeedback("Rotate");
        } else if (gesture == "Pointing Right") {
          console.log("Pointing Right");
          if (now - lastMoveTime.current.drop < 1000) {
            return;
          }
          lastMoveTime.current.drop = now;
          tetrisGameRef.current?.moveToGhostPosition();
          triggerGestureFeedback("Drop");
          const playTetrisElement = document.getElementById("tetris-container");
          if (playTetrisElement) {
            playTetrisElement.classList.add("shake");
            setTimeout(() => {
              playTetrisElement.classList.remove("shake");
            }, 200);
          }
        }
        lastGestureRef.current = gesture;
      }
    },
    [tetrisGameRef, lastMoveTime, triggerGestureFeedback, lastGestureRef],
  );

  return handleGesture;
};
