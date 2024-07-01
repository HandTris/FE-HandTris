import { PIECES } from "@/components/Tetromino";
import { WebSocketManager } from "./WebSocketManager";
import { backgroundMusic, playSoundEffect } from "@/hook/howl";

const COLORS = {
    cyan: { light: "#5BFFFF", main: "#00FFFF", dark: "#00CCCC", ghost: "#00CCCC" },
    blue: { light: "#5B5BFF", main: "#0000FF", dark: "#0000CC", ghost: "#0000CC" },
    orange: { light: "#FFAD5B", main: "#FF8C00", dark: "#CC7000", ghost: "#CC7000" },
    yellow: { light: "#FFFF5B", main: "#FFFF00", dark: "#CCCC00", ghost: "#CCCC00" },
    green: { light: "#5BFF5B", main: "#00FF00", dark: "#00CC00", ghost: "#00CC00" },
    purple: { light: "#AD5BFF", main: "#8C00FF", dark: "#7000CC", ghost: "#7000CC" },
    red: { light: "#FF5B5B", main: "#FF0000", dark: "#CC0000", ghost: "#CC0000" }
};

export class TetrisGame {
    ROW = 20;
    COL = 10;
    SQ = 40;
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

    constructor(ctx: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D, wsManager: WebSocketManager, setGameResult: (result: string) => void) {
        this.isEnd = false;
        this.gameEnd = false;
        this.hasSentEndMessage = false;
        this.board = this.createBoard();
        this.board_forsend = this.createBoard();
        this.ctx = ctx;
        this.ctx2 = ctx2;
        this.p = this.randomPiece();
        this.dropStart = Date.now();
        this.gameOver = false;
        this.wsManager = wsManager;
        this.setGameResult = setGameResult;

        this.flashRow = this.flashRowEffect;
        this.clearRow = this.clearFullRow;

        this.drawBoard();
        this.drop();
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
    }

    createBoard(): string[][] {
        let board: string[][] = [];
        for (let r = 0; r < this.ROW; r++) {
            board[r] = [];
            for (let c = 0; c < this.COL; c++) {
                board[r][c] = this.VACANT;
            }
        }
        return board;
    }

    drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isGhost: boolean = false) {
        const colorSet = COLORS[color as keyof typeof COLORS] || { light: color, main: color, dark: color, ghost: color };

        ctx.clearRect(x * this.SQ, y * this.SQ, this.SQ, this.SQ);

        if (isGhost) {
            ctx.strokeStyle = colorSet.ghost;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(x * this.SQ, y * this.SQ, this.SQ, this.SQ);
            ctx.setLineDash([]);
        } else {
            ctx.fillStyle = colorSet.main;
            ctx.fillRect(x * this.SQ, y * this.SQ, this.SQ, this.SQ);

            ctx.beginPath();
            ctx.moveTo(x * this.SQ, y * this.SQ);
            ctx.lineTo((x + 1) * this.SQ, y * this.SQ);
            ctx.lineTo(x * this.SQ, (y + 1) * this.SQ);
            ctx.fillStyle = colorSet.light;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo((x + 1) * this.SQ, y * this.SQ);
            ctx.lineTo((x + 1) * this.SQ, (y + 1) * this.SQ);
            ctx.lineTo(x * this.SQ, (y + 1) * this.SQ);
            ctx.fillStyle = colorSet.dark;
            ctx.fill();

            ctx.strokeStyle = this.GRID_COLOR;
            ctx.strokeRect(x * this.SQ, y * this.SQ, this.SQ, this.SQ);
        }
    }

    drawBoard() {
        this.ctx.fillStyle = this.VACANT;
        this.ctx.fillRect(0, 0, this.COL * this.SQ, this.ROW * this.SQ);

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

    randomPiece(): Piece {
        const r = Math.floor(Math.random() * PIECES.length);
        const piece = PIECES[r];
        return new Piece(piece.shape, piece.color, this);
    }

    drop() {
        const now = Date.now();
        const delta = now - this.dropStart;

        if (delta > 200) {
            this.p.moveDown();
            this.dropStart = Date.now();
            if (!this.gameEnd) {
                this.wsManager.sendMessageOnGaming(this.board_forsend, this.isEnd);
            }
        }

        if (!this.gameEnd && !this.gameOver) {
            requestAnimationFrame(this.drop.bind(this));
        }
    }

    hardDrop() {
        while (!this.p.collision(0, 1)) {
            this.p.moveDown();
        }
        this.p.lock();
    }

    sendMessageOnGaming(stompClient: any) {
        if (stompClient) {
            const socketUrl = stompClient.ws._transport.url;
            const match = /\/([^\/]+)\/(?:websocket)/.exec(socketUrl);

            if (match && match[1]) {
                const sessionId = match[1];
                const message = {
                    board: this.board_forsend,
                    sender: sessionId,
                    isEnd: this.isEnd,
                };

                if (stompClient.connected) {
                    if (!this.isEnd && !this.hasSentEndMessage) {
                        stompClient.send("/app/tetris", {}, JSON.stringify(message));
                        this.hasSentEndMessage = true;
                    } else if (!this.isEnd) {
                        stompClient.send("/app/tetris", {}, JSON.stringify(message));
                    }
                } else {
                    console.log("WebSocket connection is not established yet.");
                }
            } else {
                console.error("Session ID could not be extracted from URL.");
            }
        } else {
            console.error("WebSocket transport is not defined.");
        }
    }

    showGameResult(result: string) {
        this.setGameResult(result);
    }

    flashRowEffect(row: number) {
        let flashCount = 6;
        let flashInterval = 100;
        let isWhite = true;

        let flashIntervalId = setInterval(() => {
            for (let c = 0; c < this.COL; c++) {
                this.drawSquare(this.ctx, c, row, isWhite ? "GREY" : this.board[row][c]);
            }
            isWhite = !isWhite;
            flashCount--;
            if (flashCount === 0) {
                clearInterval(flashIntervalId);
                this.clearRow(row);
            }
        }, flashInterval);
    }
}

class Piece {
    tetromino: number[][][];
    color: string;
    tetrominoN: number;
    activeTetromino: number[][];
    x: number;
    y: number;
    game: TetrisGame;
    ghostY: number;

    constructor(tetromino: number[][][], color: string, game: TetrisGame) {
        this.tetromino = tetromino;
        this.color = color;
        this.tetrominoN = 0;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.x = 3;
        this.y = -2;
        this.game = game;
        this.ghostY = this.calculateGhostY();
    }

    fill(color: string, isGhost: boolean = false) {
        for (let r = 0; r < this.activeTetromino.length; r++) {
            for (let c = 0; c < this.activeTetromino[r].length; c++) {
                if (this.activeTetromino[r][c]) {
                    this.game.drawSquare(this.game.ctx, this.x + c, this.y + r, color, isGhost);
                }
            }
        }
    }

    draw() {
        this.fill(this.color);
    }

    unDraw() {
        this.fill(this.game.VACANT);
    }

    drawGhost() {
        this.unDrawGhost(); // Ensure previous ghost is cleared
        this.ghostY = this.calculateGhostY();
        const ghostColor = COLORS[this.color as keyof typeof COLORS].ghost;
        this.fillGhost(this.ghostY, ghostColor);
    }

    unDrawGhost() {
        this.fillGhost(this.ghostY, this.game.VACANT);
    }

    fillGhost(ghostY: number, color: string) {
        const ghostPositions: { x: number; y: number }[] = [];
        for (let r = 0; r < this.activeTetromino.length; r++) {
            for (let c = 0; c < this.activeTetromino[r].length; c++) {
                if (this.activeTetromino[r][c]) {
                    if (ghostY + r >= 0 && this.x + c >= 0) {
                        ghostPositions.push({ x: this.x + c, y: ghostY + r });
                    }
                }
            }
        }

        this.game.ctx.clearRect(0, 0, this.game.COL * this.game.SQ, this.game.ROW * this.game.SQ); // 현재 블록과 고스트 블록이 그려진 영역 전체 지우기
        this.game.drawBoard();

        ghostPositions.forEach(pos => {
            if (color === this.game.VACANT) {
                this.game.drawSquare(this.game.ctx, pos.x, pos.y, this.game.board[pos.y][pos.x], false);
            } else {
                this.game.drawSquare(this.game.ctx, pos.x, pos.y, color, true);
            }
        });

        this.draw(); // 현재 블록 다시 그리기
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
            this.unDrawGhost();
            this.y++;
            this.ghostY = this.calculateGhostY();
            this.drawGhost(); // 고스트 블록 그리기
            this.draw();
        } else {
            this.lock();
            this.game.p = this.game.randomPiece();
            this.game.p.drawGhost(); // 새로운 블록의 고스트 블록 그리기
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

    moveTo(x: number) {
        if (!this.collision(x - this.x, 0)) {
            this.unDraw();
            this.unDrawGhost();
            this.x = x;
            this.ghostY = this.calculateGhostY();
            this.drawGhost();
            this.draw();
        }
    }

    rotate() {
        let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
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
        this.game.wsManager.sendMessageOnGaming(this.game.board_forsend, this.game.isEnd);
    }

    collision(x: number, y: number, piece: number[][] = this.activeTetromino) {
        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece[r].length; c++) {
                if (!piece[r][c]) {
                    continue;
                }
                let newX = this.x + c + x;
                let newY = this.y + r + y;

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
