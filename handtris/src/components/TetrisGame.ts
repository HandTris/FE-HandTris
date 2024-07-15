import { PIECES } from "@/components/Tetromino";
import { WebSocketManager } from "./WebSocketManager";
import { backgroundMusic, playSoundEffect } from "@/hook/howl";
import { COLORS } from "@/styles";

export class TetrisGame {
  isDangerous: boolean;
  ROW = 20;
  COL = 10;
  SQ = 30;
  VACANT = "#303030";
  GRID_COLOR = "#2B292A";
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
  isAttack: boolean;
  isAttacked: boolean;
  nextBlock: Piece;
  isGaugeFull: boolean;
  isGaugeFullAttacked: boolean;
  pieceBag: Piece[];
  drawSquareCanvas: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    isGhost: boolean,
  ) => void;

  constructor(
    ctx: CanvasRenderingContext2D,
    ctx2: CanvasRenderingContext2D,
    wsManager: WebSocketManager,
    setGameResult: (result: string) => void,
  ) {
    this.isDangerous = false;
    this.isEnd = false;
    this.gameEnd = false;
    this.hasSentEndMessage = false;
    this.board = this.createBoard();
    this.board_forsend = this.createBoard();
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.pieceBag = this.createNewBag();
    this.p = this.getNextPieceFromBag();
    this.nextBlock = this.getNextPieceFromBag();
    this.dropStart = Date.now();
    this.gameOver = false;
    this.wsManager = wsManager;
    this.setGameResult = setGameResult;
    this.isGameStart = false;

    this.flashRow = this.flashRowEffect;
    this.clearRow = this.clearFullRow;
    this.linesCleared = 0;
    this.isRowFull = false;
    this.isAttack = false;
    this.isAttacked = false;
    this.isGaugeFull = false;
    this.isGaugeFullAttacked = false;

    this.drawBoard();
    this.drawSquareCanvas = this.drawSquare;
    this.drop();
    this.roomCode = "";
  }

  clearFullRow(row: number) {
    for (let y = row; y > 1; y--) {
      for (let c = 0; c < this.COL; c++) {
        this.board[y][c] = this.board[y - 1][c];
      }
    }
    for (let c = 0; c < this.COL; c++) {
      this.board[0][c] = this.VACANT;
    }
    this.drawBoard();
    this.linesCleared++;
  }

  createBoard(): string[][] {
    const board: string[][] = [];
    for (let r = 0; r < this.ROW; r++) {
      board[r] = [];
      for (let c = 0; c < this.COL; c++) {
        board[r][c] = this.VACANT;
      }
    }
    return board;
  }
  checkDangerousState() {
    const dangerThreshold = 5;
    for (let r = 0; r < dangerThreshold; r++) {
      for (let c = 0; c < this.COL; c++) {
        if (this.board[r][c] !== this.VACANT) {
          this.isDangerous = true;
          return;
        }
      }
    }
    this.isDangerous = false;
  }
  drawSquare(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    isGhost: boolean = false,
  ) {
    const colorSet = COLORS[color as keyof typeof COLORS] || {
      light: color,
      main: color,
      dark: color,
      ghost: color,
    };

    if (isGhost && color !== this.VACANT) {
      ctx.fillStyle = `${colorSet.main}40`;
      ctx.fillRect(x * this.SQ, y * this.SQ, this.SQ, this.SQ);

      ctx.strokeStyle = `${colorSet.main}50`;
      ctx.lineWidth = 0.6;
      ctx.strokeRect(
        x * this.SQ + 1,
        y * this.SQ + 1,
        this.SQ - 2,
        this.SQ - 2,
      );
    } else {
      ctx.fillStyle = colorSet.main;
      ctx.fillRect(x * this.SQ, y * this.SQ, this.SQ, this.SQ);

      if (color !== this.VACANT) {
        ctx.fillStyle = colorSet.light;
        ctx.beginPath();
        ctx.moveTo(x * this.SQ, y * this.SQ);
        ctx.lineTo((x + 1) * this.SQ, y * this.SQ);
        ctx.lineTo(x * this.SQ, (y + 1) * this.SQ);
        ctx.fill();
        // 블록의 어두운 부분
        ctx.fillStyle = colorSet.dark;
        ctx.beginPath();
        ctx.moveTo((x + 1) * this.SQ, y * this.SQ);
        ctx.lineTo((x + 1) * this.SQ, (y + 1) * this.SQ);
        ctx.lineTo(x * this.SQ, (y + 1) * this.SQ);
        ctx.fill();
      }

      // 그리드 선 (고스트 블록이 아닐 때만)
      if (!isGhost) {
        ctx.strokeStyle = this.GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeRect(x * this.SQ, y * this.SQ, this.SQ, this.SQ);
      }
    }
  }
  drawBoard() {
    for (let r = 0; r < this.ROW; r++) {
      for (let c = 0; c < this.COL; c++) {
        this.drawSquare(this.ctx, c, r, this.board[r][c]);
      }
    }
  }

  drawBoard2(board2: string[][]) {
    this.ctx2.fillStyle = this.VACANT;
    this.ctx2.fillRect(0, 0, this.COL * this.SQ, this.ROW * this.SQ);

    for (let r = 0; r < this.ROW; r++) {
      for (let c = 0; c < this.COL; c++) {
        this.drawSquare(this.ctx2, c, r, board2[r][c]);
      }
    }
  }
  createNewBag(): Piece[] {
    const bag = PIECES.slice(0, 7).map(
      piece => new Piece(piece.shape, piece.color, this),
    );
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }

  getNextPieceFromBag(): Piece {
    if (this.pieceBag.length === 0) {
      this.pieceBag = this.createNewBag();
    }
    return this.pieceBag.pop()!;
  }

  randomPiece(): Piece {
    return this.getNextPieceFromBag();
  }
  gaugeFullPiece(): Piece {
    const piece = PIECES[7];
    return new Piece(piece.shape, piece.color, this);
  }

  getNextBlock(): Piece {
    return this.nextBlock;
  }

  drop() {
    const now = Date.now();
    const delta = now - this.dropStart;

    if (delta > 200) {
      this.p.moveDown();
      this.dropStart = Date.now();
      if (!this.gameEnd) {
        this.wsManager.sendMessageOnGaming(
          this.board_forsend,
          this.isEnd,
          this.isAttack,
          this.roomCode,
          this.isGaugeFull,
        );
      }
    }
    this.checkDangerousState();
    if (!this.gameEnd && !this.gameOver) {
      requestAnimationFrame(this.drop.bind(this));
    }
  }

  showGameResult(result: string) {
    this.setGameResult(result);
  }

  flashRowEffect(row: number) {
    let flashCount = 6;
    const flashInterval = 100;
    let isWhite = true;

    const flashIntervalId = setInterval(() => {
      for (let c = 0; c < this.COL; c++) {
        this.drawSquare(
          this.ctx,
          c,
          row,
          isWhite ? "GREY" : this.board[row][c],
        );
      }
      isWhite = !isWhite;
      flashCount--;
      if (flashCount === 0) {
        clearInterval(flashIntervalId);
        this.clearRow(row);
      }
    }, flashInterval);
  }

  moveToGhostPosition() {
    const ghostPosition = this.calculateGhostPosition();
    this.p.moveTo(ghostPosition.x, ghostPosition.y);
    this.drawBoard();
  }

  calculateGhostPosition() {
    const originalPosition = { x: this.p.x, y: this.p.y };
    while (!this.p.collision(0, 1)) {
      this.p.y++;
    }
    const ghostPosition = { x: this.p.x, y: this.p.y };
    this.p.x = originalPosition.x;
    this.p.y = originalPosition.y;
    return ghostPosition;
  }

  addBlockRow = () => {
    const newRow = new Array(this.COL).fill("grey");
    const randomIndex = Math.floor(Math.random() * this.COL);
    newRow[randomIndex] = this.VACANT;

    this.board.push(newRow);
    this.board.shift();
    this.drawBoard();
    this.board_forsend.push(newRow);
    this.board_forsend.shift();
  };
}

export class Piece {
  tetromino: number[][][];
  color: string;
  tetrominoN: number;
  activeTetromino: number[][];
  x: number;
  y: number;
  game: TetrisGame;
  ghostY: number;
  prevGhostY: number;

  constructor(tetromino: number[][][], color: string, game: TetrisGame) {
    this.tetromino = tetromino;
    this.color = color;
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.x = 3;
    this.y = -2;
    this.game = game;
    this.ghostY = this.calculateGhostY();
    this.prevGhostY = -1;
  }

  fill(color: string, isGhost: boolean = false) {
    for (let r = 0; r < this.activeTetromino.length; r++) {
      for (let c = 0; c < this.activeTetromino[r].length; c++) {
        if (this.activeTetromino[r][c]) {
          if (!isGhost) {
            if (this.y + r >= 0 && this.x + c >= 0) {
              this.game.board_forsend[this.y + r][this.x + c] = color;
            }
            this.game.drawSquare(
              this.game.ctx,
              this.x + c,
              this.y + r,
              color,
              false,
            );
          } else if (this.y + r !== this.y) {
            this.game.drawSquare(
              this.game.ctx,
              this.x + c,
              this.y + r,
              color,
              true,
            );
          }
        }
      }
    }
  }

  draw() {
    this.fill(this.color);
    this.drawGhost();
  }

  unDraw() {
    this.fill(this.game.VACANT);
    this.unDrawGhost();
  }
  drawGhost() {
    if (this.prevGhostY !== -1) {
      this.fillGhost(this.prevGhostY, this.game.VACANT);
    }
    this.ghostY = this.calculateGhostY();
    this.fillGhost(this.ghostY, this.color);
    this.prevGhostY = this.ghostY;
  }
  unDrawGhost() {
    if (this.prevGhostY !== -1) {
      this.fillGhost(this.prevGhostY, this.game.VACANT);
      // 그리드 선 다시 그리기
      for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino[r].length; c++) {
          if (this.activeTetromino[r][c]) {
            const ghostY = this.prevGhostY + r;
            if (ghostY >= 0 && this.x + c >= 0 && ghostY > this.y + r) {
              this.game.ctx.strokeStyle = this.game.GRID_COLOR;
              this.game.ctx.lineWidth = 1;
              this.game.ctx.strokeRect(
                (this.x + c) * this.game.SQ,
                ghostY * this.game.SQ,
                this.game.SQ,
                this.game.SQ,
              );
            }
          }
        }
      }
      this.prevGhostY = -1;
    }
  }

  fillGhost(ghostY: number, color: string) {
    for (let r = 0; r < this.activeTetromino.length; r++) {
      for (let c = 0; c < this.activeTetromino[r].length; c++) {
        if (this.activeTetromino[r][c]) {
          if (ghostY + r >= 0 && this.x + c >= 0 && ghostY + r > this.y + r) {
            this.game.drawSquare(
              this.game.ctx,
              this.x + c,
              ghostY + r,
              color,
              true,
            );
          }
        }
      }
    }
  }

  calculateGhostY(): number {
    let ghostY = this.y;
    while (!this.collision(0, ghostY - this.y + 1)) {
      ghostY++;
    }
    return ghostY;
  }

  moveDown() {
    if (!this.collision(0, 1)) {
      this.unDraw();
      this.y++;
      this.draw();
    } else {
      this.lock();
      this.game.p = this.game.nextBlock;
      if (this.game.isGaugeFullAttacked == true) {
        this.game.nextBlock = this.game.gaugeFullPiece();
        this.game.isGaugeFullAttacked = false;
      } else {
        this.game.nextBlock = this.game.randomPiece();
      }
      this.game.p.draw();
    }
  }

  moveRight() {
    if (!this.collision(1, 0)) {
      this.unDraw();
      this.unDrawGhost();
      this.x++;
      this.ghostY = this.calculateGhostY();
      this.drawGhost();
      this.draw();
    }
  }

  moveLeft() {
    if (!this.collision(-1, 0)) {
      this.unDraw();
      this.unDrawGhost();
      this.x--;
      this.ghostY = this.calculateGhostY();
      this.drawGhost();
      this.draw();
    }
  }

  moveTo(x: number, y: number) {
    if (!this.collision(x - this.x, y - this.y)) {
      this.unDraw();
      this.unDrawGhost();
      this.x = x;
      this.y = y;
      this.ghostY = this.calculateGhostY();
      this.drawGhost();
      this.draw();
    }
  }

  rotate() {
    const nextPattern =
      this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {
      if (this.x > this.game.COL / 2) {
        kick = -1;
      } else {
        kick = 1;
      }
    }

    if (!this.collision(kick, 0, nextPattern)) {
      this.unDraw();
      this.unDrawGhost();
      this.x += kick;
      this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
      this.activeTetromino = nextPattern;
      this.ghostY = this.calculateGhostY();
      this.drawGhost();
      this.draw();
      playSoundEffect("/sound/move.ogg");
    }
  }

  lock() {
    this.unDrawGhost();
    for (let r = 0; r < this.activeTetromino.length; r++) {
      for (let c = 0; c < this.activeTetromino[r].length; c++) {
        if (!this.activeTetromino[r][c]) {
          continue;
        }
        if (this.y + r < 0) {
          this.game.gameOver = true;
          this.game.isEnd = true;
          backgroundMusic.pause();
          playSoundEffect("/sounds/attack.mp3");
          this.game.showGameResult("you LOSE!");
          break;
        }
        this.game.board[this.y + r][this.x + c] = this.color;
      }
    }

    for (let r = 0; r < this.game.ROW; r++) {
      let isRowFull = true;
      for (let c = 0; c < this.game.COL; c++) {
        isRowFull = isRowFull && this.game.board[r][c] !== this.game.VACANT;
      }
      if (isRowFull) {
        this.game.isRowFull = true;
        for (let y = r; y > 1; y--) {
          for (let c = 0; c < this.game.COL; c++) {
            this.game.board_forsend[y][c] = this.game.board_forsend[y - 1][c];
          }
        }
        this.game.flashRow(r);
        playSoundEffect("/sounds/clear.wav");
      }
    }
    playSoundEffect("/sound/placed.ogg");
    this.game.drawBoard();
    this.game.wsManager.sendMessageOnGaming(
      this.game.board_forsend,
      this.game.isEnd,
      this.game.isRowFull,
      this.game.roomCode,
      this.game.isGaugeFull,
    );
    this.game.isRowFull = false;
    this.game.isGaugeFull = false;
    if (this.game.isAttacked) {
      this.game.addBlockRow();
      this.game.isAttacked = false;
    }
  }

  collision(x: number, y: number, piece: number[][] = this.activeTetromino) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (!piece[r][c]) {
          continue;
        }
        const newX = this.x + c + x;
        const newY = this.y + r + y;

        if (newX < 0 || newX >= this.game.COL || newY >= this.game.ROW) {
          return true;
        }
        if (newY < 0) {
          continue;
        }
        if (this.game.board[newY][newX] !== this.game.VACANT) {
          return true;
        }
      }
    }
    return false;
  }
}
