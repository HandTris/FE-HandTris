import { LandmarkList } from "@mediapipe/hands";

export type TetrisBoard = string[][];
export type TetrisMessage = {
  board: TetrisBoard;
  isEnd: boolean;
  isAttack: boolean;
};

export interface HandLandmarkResults {
  image: CanvasImageSource;
  multiHandLandmarks: LandmarkList[];
  multiHandedness: {
    label: string;
    score: number;
  }[];
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}
