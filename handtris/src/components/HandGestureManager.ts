import { isHandGood, isHandOpen } from "@/util/handLogic";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, LandmarkList, Results } from "@mediapipe/hands";

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

  recognizeGesture(landmarks: LandmarkList, handType: string): string {
    const thumbTip = landmarks[4];
    const handBase = landmarks[17];
    if (thumbTip === undefined || handBase === undefined) {
      return "Unknown";
    }

    if (handType === "Right") {
      const thumbCalculateAngleRight = (
        thumbTip: LandmarkList[number],
        thumbBase: LandmarkList[number],
      ) => {
        const deltaY = thumbTip.y - thumbBase.y;
        const deltaX = thumbTip.x - thumbBase.x;
        const radians = Math.atan2(deltaX, deltaY);
        const degrees = radians * (180 / Math.PI);
        return degrees;
      };

      const thumbAngle = thumbCalculateAngleRight(handBase, thumbTip);
      const rightAngleThreshold = 30;
      const leftAngleThreshold = 10;
      if (isHandOpen(landmarks)) {
        return "Palm";
      }
      if (thumbAngle < -leftAngleThreshold && isHandGood(landmarks)) {
        return "Pointing Left";
      }
      if (thumbAngle > rightAngleThreshold && isHandGood(landmarks)) {
        return "Pointing Right";
      }
    } else {
      const thumbCalculateAngleLeft = (
        thumbTip: LandmarkList[number],
        thumbBase: LandmarkList[number],
      ) => {
        const deltaY = thumbTip.y - thumbBase.y;
        const deltaX = thumbTip.x - thumbBase.x;
        const radians = Math.atan2(deltaX, deltaY);
        const degrees = radians * (180 / Math.PI);
        return degrees;
      };

      const thumbAngle = thumbCalculateAngleLeft(handBase, thumbTip);
      const rightAngleThreshold = 10;
      const leftAngleThreshold = 30;
      if (isHandOpen(landmarks)) {
        return "Palm";
      }
      if (thumbAngle < -leftAngleThreshold && isHandGood(landmarks)) {
        return "Pointing Left";
      }
      if (thumbAngle > rightAngleThreshold && isHandGood(landmarks)) {
        return "Pointing Right";
      }
    }
    return "Unknown";
  }
}
