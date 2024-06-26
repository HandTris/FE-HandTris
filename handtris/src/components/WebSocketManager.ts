import SockJS from "sockjs-client";
import Stomp from "stompjs";

export class WebSocketManager {
    stompClient: any;
    connected: boolean;
    onMessage: (message: any) => void;

    constructor() {
        this.connected = false;
        this.onMessage = () => { };
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
                    this.onMessage = onMessage;

                    this.stompClient.subscribe(subscribeUrl, (message: any) => {
                        console.log("Message received: ", message);
                        this.onMessage(JSON.parse(message.body));
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

    sendMessageOnGaming(board: any, isEnd: boolean) {
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
                    isEnd: isEnd,
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
            console.log("WebSocket connection is not established yet.");
        }
    }

    sendMessageOnEntering(gameInfo: any) {
        if (this.stompClient && this.connected) {
            const message = {
                // 어떤 메시지도 보내지 않아도 됨
            };
            this.stompClient.send("/app/owner/info", {}, JSON.stringify(message));
            console.log("Message sent: ", message);
        } else {
            console.log("WebSocket connection is not established yet.");
        }
    }

    sendMessageOnWaiting(waitingInfo: { isAllReady: boolean; isStart: boolean }) {
        if (this.stompClient && this.connected) {
            const message = {
                isReady: waitingInfo.isAllReady,
                isStart: waitingInfo.isStart,
            };
            this.stompClient.send("/app/tetris/ready", {}, JSON.stringify(message));
            console.log("Message sent: ", message);
        } else {
            console.log("WebSocket connection is not established yet.");
        }
    }

    sendMessageForStart(waitingInfo: { isAllReady: boolean; isStart: boolean }) {
        if (this.stompClient && this.connected) {
            const message = {
                isReady: waitingInfo.isAllReady,
                isStart: waitingInfo.isStart,
            };
            this.stompClient.send("/app/tetris/start", {}, JSON.stringify(message));
            console.log("Message sent: ", message);
        } else {
            console.log("WebSocket connection is not established yet.");
        }
    }

    private getSessionId(): string | null {
        const url = this.stompClient.ws._transport.url;
        const match = /\/([^\/]+)\/websocket/.exec(url);
        return match ? match[1] : null;
    }
}
