import * as THREE from "three";
import { useRef, useEffect, useState } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Landmark } from "@/types";
interface ThreeSceneProps {
  handLandmarks: Landmark[] | undefined;
}
const RightJoystickModel = ({ handLandmarks }: ThreeSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const joystickRef = useRef<THREE.Object3D | null>(null);
  const [cameraAdjusted, setCameraAdjusted] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 3); // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 150, 350).normalize();
    scene.add(directionalLight);

    // Load joystick model
    const loader = new OBJLoader();
    const objUrlPlate = "/image/joystickplate.obj";
    const objUrlBall = "/image/joystickball2.obj";

    // 판
    loader.load(
      objUrlPlate,
      obj => {
        obj.traverse(node => {
          if ((node as THREE.Mesh).isMesh) {
            (node as THREE.Mesh).material = new THREE.MeshPhongMaterial({
              color: 0x3c3c3c,
              // emissive: 0x111111, // Add emissive property for better visibility
            });
          }
        });

        obj.scale.set(0.15, 0.15, 0.15); // Scale the model down
        obj.position.set(2.5, 4, 0.5); // Set initial position
        scene.add(obj);
        console.log("Joystick model loaded:", obj);
      },
      undefined,
      error => {
        console.error("An error occurred while loading the model", error);
      },
    );

    // 대+Ball
    loader.load(
      objUrlBall,
      obj => {
        obj.traverse(node => {
          if ((node as THREE.Mesh).isMesh) {
            (node as THREE.Mesh).material = new THREE.MeshPhongMaterial({
              color: 0xff0000,
              emissive: 0x333333,
              shininess: 10,
            });
          }
        });

        obj.scale.set(0.1, 0.1, 0.1); // Scale the model down
        obj.position.set(0, 0, -10); // Set initial position
        scene.add(obj);
        joystickRef.current = obj;
        console.log("Joystick model loaded:", obj);

        // Adjust camera to fit the model
        // const box = new THREE.Box3().setFromObject(obj);

        const radius = 30; // Distance from the center
        const angleInRadians = THREE.MathUtils.degToRad(30); // Convert 30 degrees to radians
        const x = 0;
        const y = radius * Math.cos(angleInRadians);
        const z = 60;
        joystickRef.current.rotation.z = 1.5708; // 90도 = 1.5708 rad

        camera.position.set(x, y, z); // Set camera position
        camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the center of the scene
        camera.updateProjectionMatrix();

        // Mark camera as adjusted
        setCameraAdjusted(true);
      },
      undefined,
      error => {
        console.error("An error occurred while loading the model", error);
      },
    );

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (handLandmarks && handLandmarks.length > 0 && joystickRef.current) {
      const landmark4 = handLandmarks[4];
      const landmark17 = handLandmarks[17];
      const joystick = joystickRef.current;

      // Calculate the angle between the z coordinates of landmark0 and landmark3
      const deltaY = landmark17.y - landmark4.y; // 사람의 조작과 웹캠에 보여지는 화면으로 인해 3과 0의 순서가 다름
      const deltaX = landmark17.x - landmark4.x;
      const angle = Math.atan2(deltaY, deltaX); // theta, 단위: rad

      // Rotate the joystick model based on the calculated angle
      if (angle > 1.05 && angle < 2.1) {
        // 60도 이상 120도 이하 움직임 제한
        joystick.rotation.z = angle;
      }

      // Adjust camera only if it hasn't been adjusted yet
      if (!cameraAdjusted && cameraRef.current) {
        // const box = new THREE.Box3().setFromObject(joystick);
        // const boxCenter = box.getCenter(new THREE.Vector3());

        const radius = 30; // Distance from the center
        const angleInRadians = THREE.MathUtils.degToRad(30); // Convert 30 degrees to radians
        const x = 0;
        const y = radius * Math.cos(angleInRadians);
        const z = 60;

        cameraRef.current.position.set(x, y, z); // Set camera position
        cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the center of the scene
        cameraRef.current.updateProjectionMatrix();

        // Mark camera as adjusted
        setCameraAdjusted(true);
      }
    }
  }, [handLandmarks, cameraAdjusted]);

  return <div ref={mountRef} style={{ width: "180px", height: "400px" }} />;
};

export default RightJoystickModel;
