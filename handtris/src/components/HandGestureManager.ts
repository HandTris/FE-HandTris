// src/components/HandGestureManager.ts

import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS, Hands } from "@mediapipe/hands";

export class HandGestureManager {
  hands: any;

  onResultsCallback: (results: any) => void;

  constructor(onResults: (results: any) => void) {
    this.onResultsCallback = onResults;
    this.hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.9,
      minTrackingConfidence: 0.7,
    });

    this.hands.onResults(this.onResultsCallback);
  }

  start(videoElement: HTMLVideoElement) {
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement });
      },
      width: 320,
      height: 240,
    });

    camera.start();
  }
}
