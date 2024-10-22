import { TetrisBoard } from "@/types";
import { getAccessToken } from "@/util/getAccessToken";
import { getRoomCode } from "@/util/getRoomCode";
import SockJS from "sockjs-client";
import Stomp, { Client, Frame, Message } from "stompjs";
import { TetrisGame } from "./TetrisGame";

interface WaitingInfo {
  isAllReady: boolean;
  isStart: boolean;
}

export class WebSocketManager {
  stompClient: Client | null;
  connected: boolean;
  onMessage: (message: unknown) => void;
  token: string | null;

  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.onMessage = () => {};
    this.token = null;
  }

  async connect(url: string): Promise<void> {
    this.token = getAccessToken();
    return new Promise((resolve, reject) => {
      const socket = new SockJS(url);
      this.stompClient = Stomp.over(socket);

      // Stomp 클라이언트의 connect 메서드를 직접 호출하는 대신
      // 커스텀 헤더를 설정할 수 있는 방법을 사용합니다.
      const headers: { [key: string]: string } = {
        Authorization: `Bearer ${this.token}`,
        roomCode: getRoomCode() as string,
      };

      this.stompClient.connect(
        headers,
        (frame?: Frame) => {
          console.log(`Connected: ${frame}`);
          this.connected = true;
          resolve();
        },
        (error: string | Frame) => {
          console.error(`Connection error: ${error}`);
          //   alert(`Failed to connect to WebSocket: ${error}`);
          reject(error);
        },
      );
    });
  }
  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.stompClient && this.connected) {
        this.stompClient.disconnect(
          () => {
            console.log("Disconnected");
            this.connected = false;
            resolve();
          },
          (error: string | Frame) => {
            console.error(`Disconnection error: ${error}`);
            // alert(`Failed to disconnect from WebSocket: ${error}`);
            reject(error);
          },
        );
      } else {
        console.warn("Stomp client is not connected");
        resolve(); // Already disconnected
      }
    });
  }

  subscribe<T>(subscribeUrl: string, onMessage: (message: T) => void) {
    if (this.connected && this.stompClient) {
      const headers = {
        Authorization: `Bearer ${this.token}`,
      };
      this.stompClient.subscribe(
        subscribeUrl,
        (message: Message) => {
          console.log("Message received: ", message);
          onMessage(JSON.parse(message.body) as T);
        },
        headers,
      );
    } else {
      console.log("WebSocket connection is not established yet.");
    }
  }

  sendMessageOnGaming(
    game: TetrisGame,
    roomCode: string | null,
    board: TetrisBoard,
    isEnd: boolean,
    isAddAttack: boolean,
    isFlipAttack: boolean,
    isDonutAttack: boolean,
  ) {
    if (this.stompClient && this.stompClient.connected) {
      const message = {
        board,
        isEnd,
        isAddAttack,
        isFlipAttack,
        isDonutAttack,
      };
      if (this.connected) {
        this.stompClient.send(
          `/app/${roomCode}/tetris`,
          { Authorization: `Bearer ${this.token}` },
          JSON.stringify(message),
        );
        console.log("Message sent: ", message);
        if (message.isFlipAttack) {
          const playOppTetrisElement =
            document.getElementById("opposer_tetris");
          if (playOppTetrisElement) {
            playOppTetrisElement.classList.add("flipped-canvas");
            game.isFlipAttackToggleOn = true;
            setTimeout(() => {
              playOppTetrisElement.classList.add("unflipped-canvas");
              setTimeout(() => {
                playOppTetrisElement.classList.remove("flipped-canvas");
                playOppTetrisElement.classList.remove("unflipped-canvas");
                game.isFlipAttackToggleOn = false;
              }, 500);
            }, 3000);
          }
        }
        if (message.isDonutAttack) {
          game.isDonutAttack = false;
          game.isDonutAttackToggleOn = true;
        }
      } else {
        console.log("WebSocket connection is not established yet.");
      }
    } else {
      console.error("stompClient ws에 연결되지 않음.");
    }
  }

  sendMessageOnEntering(gameInfo: unknown, URL: string) {
    if (this.stompClient && this.connected) {
      const message = {};
      this.stompClient.send(
        URL,
        { Authorization: `Bearer ${this.token}` },
        JSON.stringify(message),
      );
      console.log("Message sent: ", message);
    } else {
      console.log("WebSocket connection is not established yet.");
    }
  }
  sendMessageOnDisconnecting(gameInfo: unknown, URL: string, isStart: boolean) {
    if (this.stompClient && this.connected) {
      const message = {};
      this.stompClient.send(
        URL,
        { Authorization: `Bearer ${this.token}`, isStart: isStart },
        JSON.stringify(message),
      );
      console.log("Message sent: ", message);
    } else {
      console.log("WebSocket connection is not established yet.");
    }
  }

  sendMessageOnWaiting(waitingInfo: WaitingInfo, URL: string) {
    if (this.stompClient && this.connected) {
      const message = {
        isReady: waitingInfo.isAllReady,
        isStart: waitingInfo.isStart,
      };
      this.stompClient.send(
        URL,
        { Authorization: `Bearer ${this.token}` },
        JSON.stringify(message),
      );
      console.log("Message sent: ", message);
    } else {
      console.log("WebSocket connection is not established yet.");
    }
  }

  sendMessageForStart(waitingInfo: WaitingInfo, URL: string) {
    if (this.stompClient && this.connected) {
      const message = {
        isReady: waitingInfo.isAllReady,
        isStart: waitingInfo.isStart,
      };
      this.stompClient.send(
        URL,
        { Authorization: `Bearer ${this.token}` },
        JSON.stringify(message),
      );
      console.log("Message sent: ", message);
    } else {
      console.log("WebSocket connection is not established yet.");
    }
  }
}
