// src/components/TetrisGame.ts

import { PIECES } from "@/components/Tetromino";
import { WebSocketManager } from "./WebSocketManager";

export class TetrisGame {
    ROW = 20;
    COL = 10;
    SQ = 32;
    VACANT = "Grey";
    board: string[][];
    board_forsend: string[][];
    ctx: CanvasRenderingContext2D;
    ctx2: CanvasRenderingContext2D;
    p: any;
    dropStart: number;
    gameOver: boolean;
    gameEnd: boolean;
    isEnd: boolean;
    hasSentEndMessage: boolean;
    wsManager: WebSocketManager;

    constructor(ctx: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D, wsManager: WebSocketManager) {
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

        this.drawBoard();
        this.drop();
    }

    createBoard() {
        let board = [];
        for (let r = 0; r < this.ROW; r++) {
            board[r] = [];
            for (let c = 0; c < this.COL; c++) {
                board[r][c] = this.VACANT;
            }
        }
        return board;
    }

    drawSquare(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        color: string
    ) {
        let gradient = ctx.createLinearGradient(
            x * this.SQ,
            y * this.SQ,
            x * this.SQ + this.SQ,
            y * this.SQ + this.SQ
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "white");

        ctx.fillStyle = gradient;
        ctx.fillRect(x * this.SQ, y * this.SQ, this.SQ, this.SQ);

        ctx.strokeStyle = "BLACK";
        ctx.strokeRect(x * this.SQ, y * this.SQ, this.SQ, this.SQ);
    }

    drawBoard() {
        for (let r = 0; r < this.ROW; r++) {
            for (let c = 0; c < this.COL; c++) {
                this.drawSquare(this.ctx, c, r, this.board[r][c]);
            }
        }
    }

    drawBoard2(board2: string[][]) {
        for (let r = 0; r < this.ROW; r++) {
            for (let c = 0; c < this.COL; c++) {
                this.drawSquare(this.ctx2, c, r, board2[r][c]);
            }
        }
    }

    randomPiece() {
        let r = Math.floor(Math.random() * PIECES.length);
        return new Piece(PIECES[r][0], PIECES[r][1], this);
    }

    drop() {
        const now = Date.now();
        const delta = now - this.dropStart;

        if (delta > 200) {
            this.p.moveDown();
            this.dropStart = Date.now();
            if (!this.gameEnd) {
                this.wsManager.sendMessageOnGaming(this.board_forsend, this.isEnd);  // Send message after piece drops
            }
        }

        if (!this.gameEnd && !this.gameOver) {
            requestAnimationFrame(this.drop.bind(this));
        }
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
}

class Piece {
    tetromino: any;
    color: string;
    tetrominoN: number;
    activeTetromino: any;
    x: number;
    y: number;
    game: TetrisGame;

    constructor(tetromino: any, color: string, game: TetrisGame) {
        this.tetromino = tetromino;
        this.color = color;
        this.tetrominoN = 0;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.x = 3;
        this.y = -2;
        this.game = game;
    }

    fill(color: string) {
        for (let r = 0; r < this.activeTetromino.length; r++) {
            for (let c = 0; c < this.activeTetromino[r].length; c++) {
                if (this.activeTetromino[r][c]) {
                    if (this.y + r >= 0 && this.x + c >= 0) {
                        this.game.board_forsend[this.y + r][this.x + c] = color;
                    }
                    this.game.drawSquare(this.game.ctx, this.x + c, this.y + r, color);
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

    moveDown() {
        if (!this.collision(0, 1)) {
            this.unDraw();
            this.y++;
            this.draw();
        } else {
            this.lock();
            this.game.p = this.game.randomPiece();
        }
    }

    moveRight() {
        if (!this.collision(1, 0)) {
            this.unDraw();
            this.x++;
            this.draw();
        }
    }

    moveLeft() {
        if (!this.collision(-1, 0)) {
            this.unDraw();
            this.x--;
            this.draw();
        }
    }

    moveTo(x: number) {
        if (!this.collision(x - this.x, 0)) {
            this.unDraw();
            this.x = x;
            this.draw();
        }
    }

    rotate() {
        let nextPattern =
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
            this.x += kick;
            this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
            this.activeTetromino = nextPattern;
            this.draw();
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
                    alert("You lose!");
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
                        this.game.board[y][c] = this.game.board[y - 1][c];
                        this.game.board_forsend[y][c] = this.game.board_forsend[y - 1][c];
                    }
                }
                for (let c = 0; c < this.game.COL; c++) {
                    this.game.board[0][c] = this.game.VACANT;
                }
            }
        }
        this.game.drawBoard();
        this.game.wsManager.sendMessageOnGaming(this.game.board_forsend, this.game.isEnd); // Send message when a piece is locked
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
