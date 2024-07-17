import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";

export class HandGestureManager {
  hands: Hands;
  onResultsCallback: (results: Results) => void;
  camera: Camera | null = null;

  constructor(onResults: (results: Results) => void) {
    this.onResultsCallback = onResults;
    this.hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
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
  stop() {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
  }
}
