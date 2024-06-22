'use client'
import { PIECES } from '@/components/Tetromino';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS, Hands } from '@mediapipe/hands';
import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const Home: React.FC = () => {
  useEffect(() => {
    // WebSocket 연결
    let socket = new SockJS('https://api.checkmatejungle.shop/tetris');
    // const socket = new WebSocket("ws://api.checkmatejungle.shop/tetris")
    console.log('socket: ', socket);
    socket.onopen = function() {
    console.log('Socket is open');
};
    socket.onclose = function(event) {
    console.log('Socket is closed:', event);
};
    socket.onerror = function(error) {
    console.log('Socket error:', error);
};
    let stompClient = Stomp.over(socket);
    console.log('stompClient: ', stompClient);
    let connected = false;
    stompClient.connect({}, function (frame) {
      console.log('Connected: ' + frame);
      connected = true;

      stompClient.subscribe('/user/queue/tetris', function (message) {
        let tetrisMessage = JSON.parse(message.body);
        let temp = stompClient.ws._transport
        console.log('temp: ', temp);
        console.log('temp.url: ', temp.url);
        console.log('tetrisMessage.sender: ', tetrisMessage.sender);
        if (tetrisMessage.sender != temp.url) {
          drawBoard2(tetrisMessage.board as any);
        }
      });
    },function (error) {
      console.error('Connection error: ' + error);
      alert('Failed to connect to WebSocket: ' + error);
  });
    
    const videoElement = document.getElementById('video') as HTMLVideoElement;
    const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const canvasCtx = canvasElement.getContext('2d') as CanvasRenderingContext2D;
    const gestureElement = document.getElementById('gesture') as HTMLDivElement;
    const canvasTetris = document.getElementById('tetris') as HTMLCanvasElement;
    const canvasTetris2 = document.getElementById('tetrisCanvas2') as HTMLCanvasElement;
    const ctxTetris = canvasTetris.getContext('2d') as CanvasRenderingContext2D;
    const ctxTetris2 = canvasTetris2.getContext('2d') as CanvasRenderingContext2D;
    const borderElement = document.getElementById('tetris-border') as HTMLDivElement;
    let currentGesture: string = 'None';

    function onResults(results: any) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 1 });
          drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 0.05 });

          const gesture = recognizeGesture(landmarks);
          if (gesture !== currentGesture) {
            currentGesture = gesture;
            gestureElement.innerText = `Gesture: ${gesture}`;
          }

          handleHandPosition(landmarks);
        }
        borderElement.style.boxShadow = 'none'; // 손이 인식되고 있으면 테두리 효과를 제거합니다.
      } else {
        currentGesture = 'None';
        gestureElement.innerText = 'Gesture: None';
        borderElement.style.boxShadow = '0 0 20px 20px red'; // 손이 완전히 나가면 빨간색 네온사인을 켭니다.
      }
      canvasCtx.restore();
    }

    function recognizeGesture(landmarks: any[]): string {
      const thumbTip = landmarks[4];
      const indexFingerTip = landmarks[8];
      const middleFingerTip = landmarks[12];
      const ringFingerTip = landmarks[16];
      const pinkyTip = landmarks[20];
      const palmBase = landmarks[0];

      const thumbIndexDistance = Math.sqrt(
        Math.pow(thumbTip.x - indexFingerTip.x, 2) +
        Math.pow(thumbTip.y - indexFingerTip.y, 2) +
        Math.pow(thumbTip.z - indexFingerTip.z, 2)
      );

      const allFingersExtended = (thumbTip.y < palmBase.y &&
        indexFingerTip.y < palmBase.y &&
        middleFingerTip.y < palmBase.y &&
        ringFingerTip.y < palmBase.y &&
        pinkyTip.y < palmBase.y);

      if (allFingersExtended) {
        return 'Palm';
      } else if (indexFingerTip.x < thumbTip.x && middleFingerTip.x < thumbTip.x) {
        return 'Pointing Right';
      } else if (indexFingerTip.x > thumbTip.x && middleFingerTip.x > thumbTip.x) {
        return 'Pointing Left';
      }

      return 'Unknown';
    }

    function handleHandPosition(landmarks: any[]) {
      const indexFingerTip = landmarks[8];
      const warningThreshold = 0.1; // 경고를 위한 임계값 (화면의 10% 지점)

      // 웹캠 화면의 가로 중앙과 손가락의 X 위치 차이를 구합니다.
      const deltaX = indexFingerTip.x - 0.5; // 중앙이 0.5라고 가정

      // 게임 캔버스의 가로 크기와 손가락 위치를 연동합니다.
      const newBlockX = Math.floor((deltaX + 0.5) * COL); // -0.5 ~ 0.5 -> 0 ~ COL

      if (newBlockX >= 0 && newBlockX < COL) {
        p.moveTo(newBlockX);
      }

      // 손가락 위치가 웹캠의 가로 끝에 가까워질 때 경고 테두리 효과를 추가합니다.
      if (indexFingerTip.x < warningThreshold || indexFingerTip.x > 1 - warningThreshold) {
        borderElement.style.boxShadow = '0 0 20px 20px yellow';
      }
    }

    const hands = new Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.9,
      minTrackingConfidence: 0.7
    });
    hands.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 320,
      height: 240
    });
    camera.start();

    const ROW = 20;
    const COL = 10;
    const SQ = 32;
    const VACANT = "Grey"; // color of an empty square

    // draw a square with gradient style
    function drawSquare(x: number, y: number, color: string) {
      let gradient = ctxTetris.createLinearGradient(x * SQ, y * SQ, x * SQ + SQ, y * SQ + SQ);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "white");

      ctxTetris.fillStyle = gradient;
      ctxTetris.fillRect(x * SQ, y * SQ, SQ, SQ);

      ctxTetris.strokeStyle = "BLACK";
      ctxTetris.strokeRect(x * SQ, y * SQ, SQ, SQ);
    }

    // create the board(초기 보드 만들어진 거)
    let board: string[][] = [];
    for (let r = 0; r < ROW; r++) {
      board[r] = [];
      for (let c = 0; c < COL; c++) {
        board[r][c] = VACANT;
      }
    }
    // 초기 전달을 위한 보드
    let board_forsend: string[][] = [];
    for (let r = 0; r < ROW; r++) {
      board_forsend[r] = [];
      for (let c = 0; c < COL; c++) {
        board_forsend[r][c] = VACANT;
      }
    }

    // draw the board
    function drawBoard() {
      for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
          drawSquare(c, r, board[r][c]);
        }
      }
    }
    drawBoard();

    // generate random pieces
    function randomPiece() {
      let r = Math.floor(Math.random() * PIECES.length); // 0 ~ 6
      return new Piece(PIECES[r][0], PIECES[r][1]);
    }

    let p = randomPiece();

    // The Object Piece
    function Piece(this: any, tetromino: any, color: any) {
      this.tetromino = tetromino;
      this.color = color;

      this.tetrominoN = 0; // we start from the first pattern
      this.activeTetromino = this.tetromino[this.tetrominoN];

      // we need to control the pieces(시작점)
      this.x = 3;
      this.y = -2;
    }

    // fill function
    Piece.prototype.fill = function (this: any, color: string) {
      for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino[r].length; c++) {
          if (this.activeTetromino[r][c]) {
            if (this.y + r >= 0 && this.x + c >= 0) {
              board_forsend[this.y + r][this.x + c] = color;
            }
            drawSquare(this.x + c, this.y + r, color);
          }
        }
      }
    }

    // draw a piece to the board
    Piece.prototype.draw = function (this: any) {
      this.fill(this.color);
    }

    // undraw a piece
    Piece.prototype.unDraw = function (this: any) {
      this.fill(VACANT);
    }

    // move down the piece
    Piece.prototype.moveDown = function (this: any) {
      if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
      } else {
        // we lock the piece and generate a new one
        this.lock();
        p = randomPiece();
      }
    }

    // move Right the piece
    Piece.prototype.moveRight = function (this: any) {
      if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
      }
    }

    // move Left the piece
    Piece.prototype.moveLeft = function (this: any) {
      if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
      }
    }

    // move to specific x position
    Piece.prototype.moveTo = function (this: any, x: number) {
      if (!this.collision(x - this.x, 0, this.activeTetromino)) {
        this.unDraw();
        this.x = x;
        this.draw();
      }
    }

    // rotate the piece clockwise
    Piece.prototype.rotate = function (this: any) {
      let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
      let kick = 0;

      if (this.collision(0, 0, nextPattern)) {
        if (this.x > COL / 2) {
          kick = -1; // move the piece to the left
        } else {
          kick = 1; // move the piece to the right
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

    let dropStart = Date.now();
    let gameOver = false;

// 메시지 전송 함수
function sendTetrisMessage(board) {
  // SockJS URL에서 세션 ID 추출
  let match = /\/([^\/]+)\/(?:tetris|sockjs)/.exec(socket.url);
  console.log(stompClient.ws)
  let sessionId = stompClient.ws._transport
  // match가 null인지 확인하여 에러 처리
  if (match && match[1]) {
    console.log("Session ID:", sessionId);

    if (connected) {
      let message = {
        board: board,
        sender: sessionId.url,
      };
      stompClient.send("/app/tetris", {}, JSON.stringify(message));
    } else {
      console.log("WebSocket connection is not established yet.");
    }
  } else {
    console.error("Session ID could not be extracted from URL.");
  }
}



    function drop() {
      sendTetrisMessage(board_forsend as any);
      let now = Date.now();
      let delta = now - dropStart;
      if (delta > 200) {
        p.moveDown();
        dropStart = Date.now();
        
      }
      if (!gameOver) {
        requestAnimationFrame(drop);
      }
    }
    // draw the board
    function drawSquare2(x: number, y: number, color: string) {
      let gradient = ctxTetris2.createLinearGradient(x * SQ, y * SQ, x * SQ + SQ, y * SQ + SQ);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "white");

      ctxTetris2.fillStyle = gradient;
      ctxTetris2.fillRect(x * SQ, y * SQ, SQ, SQ);

      ctxTetris2.strokeStyle = "BLACK";
      ctxTetris2.strokeRect(x * SQ, y * SQ, SQ, SQ);
    }

    function drawBoard2(board2) {
      for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
          drawSquare2(c, r, board2[r][c]);
        }
      }
    }
    drop();

    Piece.prototype.lock = function (this: any) {
      for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino[r].length; c++) {
          if (!this.activeTetromino[r][c]) {
            continue;
          }
          if (this.y + r < 0) {
            alert("Game Over");
            gameOver = true;
            break;
          }
          board[this.y + r][this.x + c] = this.color;
        }
      }
      for (let r = 0; r < ROW; r++) {
        let isRowFull = true;
        for (let c = 0; c < COL; c++) {
          isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if (isRowFull) {
          for (let y = r; y > 1; y--) {
            for (let c = 0; c < COL; c++) {
              board[y][c] = board[y - 1][c];
              board_forsend[y][c] = board_forsend[y - 1][c];
            }
          }
          for (let c = 0; c < COL; c++) {
            board[0][c] = VACANT;
          }
        }
      }
      drawBoard();
    }

    Piece.prototype.collision = function (this: any, x: number, y: number, piece: number[][]) {
      for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
          if (!piece[r][c]) {
            continue;
          }
          let newX = this.x + c + x;
          let newY = this.y + r + y;

          if (newX < 0 || newX >= COL || newY >= ROW) {
            return true;
          }
          if (newY < 0) {
            continue;
          }
          if (board[newY][newX] != VACANT) {
            return true;
          }
        }
      }
      return false;
    }

    document.addEventListener("keydown", CONTROL);

    function CONTROL(event: KeyboardEvent) {
      if (event.keyCode == 37) {
        p.moveLeft();
        dropStart = Date.now();
      } else if (event.keyCode == 38) {
        p.rotate();
        dropStart = Date.now();
      } else if (event.keyCode == 39) {
        p.moveRight();
        dropStart = Date.now();
      } else if (event.keyCode == 40) {
        p.moveDown();
        dropStart = Date.now();
      }
    }
  }, []);

  return (
    <>
      <div className="grid-container">
        <div id="webcam-container">
          <div id="gesture">Gesture: None</div>
          <video id="video" width="320" height="240" autoPlay className="hidden"></video>
          <canvas id="canvas" width="320" height="240"></canvas>
        </div>
        <div id="webcam-container">
          <div id="tetris-container">
            <canvas id="tetris" width="320" height="640"></canvas>
            <div id="tetris-border"></div>
          </div>
        </div>
        <div id="webcam-container">
          <canvas id="tetrisCanvas2" width="320" height="640"></canvas>
        </div>
        <div id="webcam-container">
          <div className=''> 상대방 웹캠 보일 디브 </div>
          <div id="remoteStreamDiv"> remote Stream Div</div>
          <button type="button" id="startSteamBtn">start Streams</button>
        </div>
      </div>
    </>
  );
};

export default Home;
