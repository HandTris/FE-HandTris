import { Landmark } from "@/types";

// 마디 사이의 각도 확인 함수 ----------------------------------------------------------------------
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dotProduct = ab.x * bc.x + ab.y * bc.y + ab.z * bc.z;
  const magnitudeAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y + ab.z * ab.z);
  const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

  const angleInRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));
  const angleInDegrees = angleInRadians * (180 / Math.PI); // 라디안을 도로 변환
  return angleInDegrees;
}
// 손가락 펴짐 확인 함수 ----------------------------------------------------------------------
export function isFingerStraight(
  landmarks: Landmark[],
  fingerIndex: number,
): boolean {
  const baseIndex = fingerIndex * 4 + 1; // 손가락 시작 인덱스 계산

  const wrist = landmarks[0];
  const cmc = landmarks[baseIndex];
  const mcp = landmarks[baseIndex + 1];
  const dip = landmarks[baseIndex + 2];
  const tip = landmarks[baseIndex + 3];

  // 손가락 관절 사이의 각도 계산
  const angle1 = calculateAngle(wrist, cmc, mcp);
  const angle2 = calculateAngle(cmc, mcp, dip);
  const angle3 = calculateAngle(mcp, dip, tip);

  // 각도 임계값 설정 (직선에 가까울수록 작은 값)
  const firstAngle = 60;
  const secondAngle = 30;
  const thirdAngle = 20;

  // 모든 각도가 임계값보다 작으면 손가락이 펴져있다고 판단
  // 첫번째 기울기는 손목에서 부터 시작하는 것이기 때문에 어느정도 구부림 허용
  return angle1 < firstAngle && angle2 < secondAngle && angle3 < thirdAngle;
}
// 손가락 굽힘 확인 함수 ----------------------------------------------------------------------
export function isFingerBent(
  landmarks: Landmark[],
  fingerIndex: number,
): boolean {
  const baseIndex = fingerIndex * 4 + 1; // 손가락 시작 인덱스 계산
  const wrist = landmarks[0];
  const tip = landmarks[baseIndex + 3];

  // 손가락 끝과 손목 사이의 거리 계산
  const distance = Math.sqrt(
    (tip.x - wrist.x) ** 2 + (tip.y - wrist.y) ** 2 + (tip.z - wrist.z) ** 2,
  );

  // 거리 임계값 설정 (손가락 길이에 따라 적절히 조절)
  const distanceThreshold = 0.19; // 예시 값 (손가락 길이의 약 1/3 정도)
  if (distance < distanceThreshold) {
    return true;
  }

  const cmc = landmarks[baseIndex];
  const mcp = landmarks[baseIndex + 1];
  const dip = landmarks[baseIndex + 2];

  // 손가락 관절 사이의 각도 계산
  const angle1 = calculateAngle(wrist, cmc, mcp);
  const angle2 = calculateAngle(cmc, mcp, dip);

  // 각도 임계값 설정 (굽힘에 가까울수록 큰 값)
  const firstAngle = 20; // 180 - 60
  const secondAngle = 80; // 180 - 30
  const secondAngleThreshold = 120; // 두 번째 각도 임계값 (120도 초과 시 true)

  // 두 번째 각도가 임계값을 초과하면 바로 true 반환
  if (angle2 > secondAngleThreshold) {
    return true;
  }

  // 모든 각도가 임계값보다 크면 손가락이 굽혀져 있다고 판단
  return angle1 > firstAngle && angle2 > secondAngle;
}

// 엄지와 다른 손가락 사이의 거리 확인 함수 ----------------------------------------------------------------------
export function isThumbAwayFromOtherFingers(landmarks: Landmark[]): boolean {
  const thumbTip = landmarks[4];
  const tapDistance = 0.075;

  // 다른 손가락 끝점들과의 거리 계산
  const distances = [8, 12, 16, 20].map(index => {
    const fingerTip = landmarks[index];
    return Math.hypot(
      thumbTip.x - fingerTip.x,
      thumbTip.y - fingerTip.y,
      thumbTip.z - fingerTip.z,
    );
  });

  // 모든 거리가 임계값보다 크면 true 반환
  return distances.every(distance => distance > tapDistance);
}

// 점과 직선 사이의 수직 거리를 계산하는 함수 (별도로 구현해야 함)
function pointToLinePerpendicularDistance(
  point: Landmark,
  lineStart: Landmark,
  lineEnd: Landmark,
) {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const dz = lineEnd.z - lineStart.z;

  const numerator = Math.abs(
    (point.y - lineStart.y) * dx -
      (point.x - lineStart.x) * dy +
      (point.z - lineStart.z) * dz,
  );
  const denominator = Math.sqrt(dx * dx + dy * dy + dz * dz);

  return numerator / denominator;
}

// 엄지 손가락 펴짐 확인 함수 (5개 랜드마크 사용) ----------------------------------------------------------------------
export function thumbFingerStraight(landmarks: Landmark[]): boolean {
  const wrist = landmarks[0];
  const cmc = landmarks[1];
  const mcp = landmarks[2];
  const dip = landmarks[3];
  const tip = landmarks[4];

  // landmark 5와 6의 좌표
  const landmark5 = landmarks[5];
  const landmark6 = landmarks[6];
  // landmark 5와 6 사이의 거리 계산
  const distance56 = Math.sqrt(
    (landmark6.x - landmark5.x) ** 2 +
      (landmark6.y - landmark5.y) ** 2 +
      (landmark6.z - landmark5.z) ** 2,
  );

  // 마디의 길이가 일정 길이 이상일 때 조건 추가
  if (distance56 > 0.05) {
    // landmark 5와 6을 잇는 직선과 엄지 손가락 끝 사이의 수직 거리 계산
    const perpendicularDistance = pointToLinePerpendicularDistance(
      tip,
      landmark5,
      landmark6,
    );

    // 엄지 손가락 끝의 z 좌표 가져오기 (화면과의 거리)
    const thumbTipZ = landmarks[4].z;

    // z 좌표에 따라 임계값 비율 조절 (예시)
    // z 좌표에 따른 임계값 비율 계산 (선형 보간)
    const maxZ = -0.05; // 화면에 가장 가까운 z 값
    const minZ = -0.025; // 화면에서 가장 먼 z 값
    const zRatio = Math.max(0, Math.min(1, (thumbTipZ - maxZ) / (minZ - maxZ))); // 0~1 사이 값으로 정규화

    const openThresholdRatio = 0.7 + (1.05 - 0.7) * zRatio; // 0.70 ~ 1.05
    const closeThresholdRatio = 0.47 + (0.53 - 0.47) * zRatio; // 0.50 ~ 0.53

    // 임계값 계산
    const openThreshold = distance56 * openThresholdRatio;
    const closeThreshold = distance56 * closeThresholdRatio;

    // 엄지 펴짐/굽힘 판단
    if (perpendicularDistance < closeThreshold) {
      return false; // 엄지 굽힘
    }

    if (perpendicularDistance > openThreshold) {
      return true; // 엄지 펴짐
    }
  }

  // 손가락 관절 사이의 각도 계산
  const angle1 = calculateAngle(wrist, cmc, mcp);
  const angle2 = calculateAngle(cmc, mcp, dip);
  const angle3 = calculateAngle(mcp, dip, tip);

  // 각도 임계값 설정 (직선에 가까울수록 작은 값)
  const firstAngle = 50;
  const secondAngle = 25;
  const thirdAngle = 35;
  // 엄지와 다른 손가락 사이의 거리 충분 여부 확인
  const isThumbAway = isThumbAwayFromOtherFingers(landmarks);

  // 모든 각도 조건을 만족하고, 엄지와 검지 사이의 거리가 임계값보다 크면 true 반환
  return (
    angle1 < firstAngle &&
    angle2 < secondAngle &&
    angle3 < thirdAngle &&
    isThumbAway
  );
}

// 엄지 손가락 굽힘 확인 함수 ----------------------------------------------------------------------
export function thumbFingerBent(landmarks: Landmark[]): boolean {
  const baseIndex = 1; // 손가락 시작 인덱스 계산
  const wrist = landmarks[0];
  const tip = landmarks[baseIndex + 3];

  // 손가락 끝과 손목 사이의 거리 계산
  const distance = Math.sqrt(
    (tip.x - wrist.x) ** 2 + (tip.y - wrist.y) ** 2 + (tip.z - wrist.z) ** 2,
  );

  // 거리 임계값 설정 (손가락 길이에 따라 적절히 조절)
  const distanceThreshold = 0.19; // 예시 값 (손가락 길이의 약 1/3 정도)
  if (distance < distanceThreshold) {
    return true;
  }

  const mcp = landmarks[baseIndex + 1];
  const dip = landmarks[baseIndex + 2];

  // 손가락 관절 사이의 각도 계산
  const angle3 = calculateAngle(mcp, dip, tip);

  // 각도 임계값 설정 (굽힘에 가까울수록 큰 값)
  const thirdAngle = 20; // 180 - 30

  // 모든 각도가 임계값보다 크면 손가락이 굽혀져 있다고 판단
  return angle3 > thirdAngle;
}

// 보자기 ----------------------------------------------------------------------
export function isHandOpen(landmarks: Landmark[]): boolean {
  const thumbIsStraight = thumbFingerStraight(landmarks); // 엄지
  const indexIsStraight = isFingerStraight(landmarks, 1); // 검지
  const middleIsStraight = isFingerStraight(landmarks, 2); // 중지
  const ringIsStraight = isFingerStraight(landmarks, 3); // 약지
  const pinkyIsStraight = isFingerStraight(landmarks, 4); // 새끼
  return (
    thumbIsStraight &&
    indexIsStraight &&
    middleIsStraight &&
    ringIsStraight &&
    pinkyIsStraight
  );
}
// 주먹 ----------------------------------------------------------------------
export function isHandBent(landmarks: Landmark[]): boolean {
  const thumbIsBent = !thumbFingerStraight(landmarks); // 엄지
  const indexIsBent = isFingerBent(landmarks, 1); // 검지
  const middleIsBent = isFingerBent(landmarks, 2); // 중지
  const ringIsBent = isFingerBent(landmarks, 3); // 약지
  const pinkyIsBent = isFingerBent(landmarks, 4); // 새끼

  return (
    thumbIsBent && indexIsBent && middleIsBent && ringIsBent && pinkyIsBent
  );
}
// 따봉 ----------------------------------------------------------------------
export function isHandGood(landmarks: Landmark[]): boolean {
  const thumbIsBent = thumbFingerStraight(landmarks); // 엄지
  const indexIsBent = isFingerBent(landmarks, 1); // 검지
  const middleIsBent = isFingerBent(landmarks, 2); // 중지
  const ringIsBent = isFingerBent(landmarks, 3); // 약지
  const pinkyIsBent = isFingerBent(landmarks, 4); // 새끼

  return (
    thumbIsBent && indexIsBent && middleIsBent && ringIsBent && pinkyIsBent
  );
}
