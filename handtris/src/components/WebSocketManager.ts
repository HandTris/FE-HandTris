// src/components/WebSocketManager.ts
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export class WebSocketManager {
    stompClient: any;
    connected: boolean;
    onMessage: (message: any) => void;

    constructor(url: string, onMessage: (message: any) => void) {
        this.connected = false;
        this.onMessage = onMessage;
        const socket = new SockJS(url);
        this.stompClient = Stomp.over(socket);

        this.stompClient.connect(
            {},
            (frame: any) => {
                console.log("Connected: " + frame);
                this.connected = true;

                this.stompClient.subscribe("/user/queue/tetris", (message: any) => {
                    console.log("Message received: ", message);
                    onMessage(JSON.parse(message.body));
                });
            },
            (error: any) => {
                console.error("Connection error: " + error);
                alert("Failed to connect to WebSocket: " + error);
            }
        );
    }

    sendMessage(destination: string, body: any) {
        if (this.connected) {
            this.stompClient.send(destination, {}, JSON.stringify(body));
            console.log("Message sent: ", body);
        } else {
            console.log("WebSocket connection is not established yet.");
        }
    }

    joinRoom(roomId: string, username: string) {
        this.sendMessage("/app/join", { roomId, username });
    }

    ready(roomId: string, username: string) {
        this.sendMessage("/app/ready", { roomId, username });
    }

    startGame(roomId: string) {
        this.sendMessage("/app/start", { roomId });
    }
}
