import { Piece } from "@/components/TetrisGame";
import { WebSocketManager } from "@/components/WebSocketManager";
import { LandmarkList } from "@mediapipe/hands";

export type TetrisBoard = string[][];
export type TetrisMessage = {
  board: TetrisBoard;
  isEnd: boolean;
  isAddAttack: boolean;
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

export type UserInfo = {
  nickname: string;
  win: number;
  lose: number;
  winRate: number;
  profileImageUrl: string;
};

export interface TetrisGame {
  isDangerous: boolean;
  ROW: number;
  COL: number;
  SQ: number;
  VACANT: string;
  GRID_COLOR: string;
  board: string[][];
  board_forsend: string[][];
  ctx: CanvasRenderingContext2D;
  ctx2: CanvasRenderingContext2D;
  p: Piece;
  dropStart: number;
  gameOver: boolean;
  gameEnd: boolean;
  isEnd: boolean;
  hasSentEndMessage: boolean;
  wsManager: WebSocketManager;
  setGameResult: (result: string) => void;
  flashRow: (row: number) => void;
  clearRow: (row: number) => void;
  linesCleared: number;
  roomCode: string | null;
  isGameStart: boolean;
  isRowFull: boolean;
  isAddAttack: boolean;
  isAddAttacked: boolean;
  nextBlock: Piece;
  isFlipAttack: boolean;
  isDonutAttack: boolean;
  isDonutAttacked: boolean;
  pieceBag: Piece[];
  toggleAttackEffect: boolean;
  toggleAttackedEffect: boolean;
  previousGreyRows: Set<number>;
  drawSquareCanvas: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    isGhost: boolean,
  ) => void;
  drawSquare: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    isGhost: boolean,
  ) => void;
  createBoard: () => string[][];
  checkDangerousState: () => void;
  drawBoard: () => void;
  drawBoard2: (board2: string[][]) => void;
  createNewBag: () => Piece[];
  getNextPieceFromBag: () => Piece;
  randomPiece: () => Piece;
  gaugeFullPiece: () => Piece;
  getNextBlock: () => Piece;
  drop: () => void;
  showGameResult: (result: string) => void;
  flashRowEffect: (row: number) => void;
  moveToGhostPosition: () => void;
  calculateGhostPosition: () => { x: number; y: number };
  addBlockRow: () => void;
}
