import { Hands, Results } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS, LandmarkList } from "@mediapipe/hands";
import { isHandGood, isHandOpen } from "@/util/handLogic";
import { Camera } from "@mediapipe/camera_utils";

interface ExtendedResults extends Results {
  bothHandsDetected: boolean;
}

type SetLandmarksFunction = React.Dispatch<
  React.SetStateAction<LandmarkList | undefined>
>;

export class HandGestureManager {
  hands: Hands;
  camera: Camera | null = null;
  setLeftHandLandmarks: SetLandmarksFunction;
  setRightHandLandmarks: SetLandmarksFunction;
  handleGesture: (gesture: string, handType: string) => void;
  onResultsCallback: (results: ExtendedResults) => void;

  constructor(
    setLeftHandLandmarks: SetLandmarksFunction,
    setRightHandLandmarks: SetLandmarksFunction,
    handleGesture: (gesture: string, handType: string) => void,
    onResults: (results: ExtendedResults) => void,
  ) {
    this.onResultsCallback = onResults;
    this.setLeftHandLandmarks = setLeftHandLandmarks;
    this.setRightHandLandmarks = setRightHandLandmarks;
    this.handleGesture = handleGesture;
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

    this.hands.onResults(this.processResults);
  }
  processResults = (results: Results) => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const canvasCtx = canvas?.getContext("2d");

    if (!canvas || !canvasCtx) {
      console.error("Canvas or canvas context is not available");
      return;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    let leftHandDetected = false;
    let rightHandDetected = false;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i] as LandmarkList;
        const classification = results.multiHandedness[i];
        const handType = classification.label;
        const landmarkColor = handType === "Left" ? "#FF0000" : "#0A8008";

        for (let j = 0; j < landmarks.length; j++) {
          landmarks[j].x = 1 - landmarks[j].x;
        }
        drawLandmarks(canvasCtx, landmarks, {
          color: landmarkColor,
          lineWidth: 0.1,
        });
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#ffffff",
          lineWidth: 1,
        });
        for (let j = 0; j < landmarks.length; j++) {
          landmarks[j].x = 1 - landmarks[j].x;
        }

        const gesture = this.recognizeGesture(landmarks, handType);
        if (handType === "Left") {
          this.setLeftHandLandmarks(landmarks);
          leftHandDetected = true;
        } else {
          this.setRightHandLandmarks(landmarks);
          rightHandDetected = true;
        }
        this.handleGesture(gesture, handType);
      }
    }

    canvasCtx.restore();
    this.onResultsCallback({
      ...results,
      bothHandsDetected: leftHandDetected && rightHandDetected,
    } as ExtendedResults);
  };

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
