// src/components/WebSocketManager.ts

import SockJS from "sockjs-client";
import Stomp from "stompjs";

export class WebSocketManager {
    stompClient: any;
    connected: boolean;

    constructor() {
        this.connected = false;
    }
    async connect(url: string, subscribeUrl: string, onMessage: (message: any) => void): Promise<void> {
        return new Promise((resolve, reject) => {
          const socket = new SockJS(url);
          this.stompClient = Stomp.over(socket);
          this.stompClient.connect(
            {},
            (frame: any) => {
              console.log("Connected: " + frame);
              this.connected = true;
    
              this.stompClient.subscribe(subscribeUrl, (message: any) => {
                console.log("Message received: ", message);
                onMessage(JSON.parse(message.body));
              });
              resolve();
            },
            (error: any) => {
              console.error("Connection error: " + error);
              alert("Failed to connect to WebSocket: " + error);
              reject(error);
            }
            );
        });
    }

    sendMessage(board: any) {
        if (
            this.stompClient &&
            this.stompClient.ws &&
            this.stompClient.ws._transport
        ) {
            const socketUrl = this.stompClient.ws._transport.url;
            const match = /\/([^\/]+)\/(?:websocket)/.exec(socketUrl);

            if (match && match[1]) {
                const sessionId = match[1];
                const message = {
                    board: board,
                    sender: sessionId,
                };
                if (this.connected) {
                    this.stompClient.send("/app/tetris", {}, JSON.stringify(message));
                    console.log("Message sent: ", message);
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
    sendMessageOnWaiting(gameInfo: any) {
        if (
            this.stompClient &&
            this.stompClient.ws &&
            this.stompClient.ws._transport
        ) {
            const socketUrl = this.stompClient.ws._transport.url;
            const match = /\/([^\/]+)\/(?:websocket)/.exec(socketUrl);

            if (match && match[1]) {
                const sessionId = match[1];
                const message = {
                    isOwner: gameInfo.isOwner,
                    isReady: gameInfo.isReady,
                    isStart: gameInfo.isStart,
                    sessionId: sessionId,
                };
                if (this.connected) {
                    this.stompClient.send("/app/owner/info", {}, JSON.stringify(message));
                    console.log("Message sent: ", message);
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
