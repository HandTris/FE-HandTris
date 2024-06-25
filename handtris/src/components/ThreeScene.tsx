import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useRef, useEffect } from "react";

const ThreeScene = ({ handLandmarks }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const handModelRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Helpers
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Load hand model
    const loader = new GLTFLoader();
    loader.load(
      "/image/hand.glb",
      (gltf) => {
        const handModel = gltf.scene;
        handModel.traverse((node) => {
          if (node.isMesh) {
            node.material = new THREE.MeshPhongMaterial({
              color: 0xff0000,
              emissive: 0x333333, // Add emissive property for better visibility
            });
          }
          if (node.isBone) {
            const match = node.name.match(/\d+$/);
            if (match) {
              const boneIndex = parseInt(match[0], 10);
              if (boneIndex >= 0 && boneIndex <= 20) {
                node.name = `Bone${boneIndex}`;
              }
            }
          }
        });
        scene.add(handModel);
        handModelRef.current = handModel;
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the model", error);
      }
    );

    // Camera position
    camera.position.z = 5;

    // Store references
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
    if (handLandmarks.length > 0 && handModelRef.current) {
      const landmarks = handLandmarks[0];
      const handModel = handModelRef.current;

      for (let i = 0; i < 21; i++) {
        const landmark = landmarks[i];
        const boneName = `Bone${i}`;
        const fingerBone = handModel.getObjectByName(boneName);
        if (fingerBone) {
          // Adjust position based on landmarks
          fingerBone.position.set(
            (landmark.x - 0.5) * 2,
            -(landmark.y - 0.5) * 2,
            (landmark.z - 0.5) * 2
          );
          // Adjust rotation if necessary
          fingerBone.rotation.set(
            THREE.MathUtils.degToRad(landmark.x * 180),
            THREE.MathUtils.degToRad(landmark.y * 180),
            THREE.MathUtils.degToRad(landmark.z * 180)
          );
        }
      }
    }
  }, [handLandmarks]);

  return <div ref={mountRef} style={{ width: "320px", height: "240px" }} />;
};

export default ThreeScene;
