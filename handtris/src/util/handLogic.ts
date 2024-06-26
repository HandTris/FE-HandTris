export function isHandOpen(landmarks: any[]): boolean {
    const thumbIsStraight = isFingerStraight(landmarks, 0); // 엄지
    const indexIsStraight = isFingerStraight(landmarks, 1); // 검지
    const middleIsStraight = isFingerStraight(landmarks, 2); // 중지
    const ringIsStraight = isFingerStraight(landmarks, 3); // 약지
    const pinkyIsStraight = isFingerStraight(landmarks, 4); // 새끼
    return thumbIsStraight && indexIsStraight && middleIsStraight && ringIsStraight && pinkyIsStraight;
}


export function isFingerStraight(landmarks: any[], fingerIndex: number): boolean {
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
    const thirdAngle = 30;

    // 모든 각도가 임계값보다 작으면 손가락이 펴져있다고 판단
    // 첫번째 기울기는 손목에서 부터 시작하는 것이기 때문에 어느정도 구부림 허용
    return angle1 < firstAngle && angle2 < secondAngle && angle3 < thirdAngle;
}

export function calculateAngle(a: any, b: any, c: any): number {
    const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

    const dotProduct = ab.x * bc.x + ab.y * bc.y + ab.z * bc.z;
    const magnitudeAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y + ab.z * ab.z);
    const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

    const angleInRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));
    const angleInDegrees = angleInRadians * (180 / Math.PI); // 라디안을 도로 변환
    return angleInDegrees;
}
