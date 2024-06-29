import * as THREE from 'three';
import { useRef, useEffect, useState } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const ThreeScene = ({ handLandmarks }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const joystickRef = useRef(null);
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
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true , alpha: true});
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);
    // Axes Helper
    const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

    // Load joystick model
    const loader = new OBJLoader();
    const objUrlPlate = "/image/joystickplate.obj";
    const objUrlBall = "/image/joystickball2.obj";
    
    // 판
    loader.load(
      objUrlPlate,
      (obj) => {
        obj.traverse((node) => {
          if (node.isMesh) {
            node.material = new THREE.MeshPhongMaterial({
              color: 0xff0000,
              emissive: 0x333333, // Add emissive property for better visibility
            });
          }
        });

        obj.scale.set(0.15, 0.15, 0.15); // Scale the model down
        obj.position.set(0, 1, 1); // Set initial position
        scene.add(obj);
        // joystickRef.current = obj;
        console.log('Joystick model loaded:', obj);
      },
      undefined,
      (error) => {
        console.error('An error occurred while loading the model', error);
      }
    );
    // 대+Ball
    loader.load(
        objUrlBall,
        (obj) => {
          obj.traverse((node) => {
            if (node.isMesh) {
              node.material = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                emissive: 0x333333, // Add emissive property for better visibility
              });
            }
          });
  
          obj.scale.set(0.1, 0.1, 0.1); // Scale the model down
          obj.position.set(-5, -1.1, 0); // Set initial position
          scene.add(obj);
          joystickRef.current = obj;
          console.log('Joystick model loaded:', obj);
  
          // Adjust camera to fit the model
          const box = new THREE.Box3().setFromObject(obj);
          const boxSize = box.getSize(new THREE.Vector3()).length();
          const boxCenter = box.getCenter(new THREE.Vector3());
  
          const halfSizeToFitOnScreen = boxSize * 0.5;
          const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
          const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  
          camera.position.copy(boxCenter);
          camera.position.z += distance * 2; // Add some distance for better view
          camera.lookAt(boxCenter);
          camera.updateProjectionMatrix();
  
          // Mark camera as adjusted
          setCameraAdjusted(true);
        },
        undefined,
        (error) => {
          console.error('An error occurred while loading the model', error);
        }
      );

    // Camera position
    camera.position.z = 5; // Move camera back to see the model

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
    if (handLandmarks.length > 0 && joystickRef.current) {
      const landmark0 = handLandmarks[0][0];
      const landmark3 = handLandmarks[0][3];
      const joystick = joystickRef.current;

      // Update the position of the joystick to match handLandmarks[0]
      joystick.position.set(
        joystick.position.x,
        joystick.position.y,
        joystick.position.z
      );

      // Calculate the angle between the z coordinates of landmark0 and landmark3
      const deltaZ = landmark3.z - landmark0.z; // 사람의 조작과 웹캠에 보여지는 화면으로 인해 3과 0의 순서가 다름
      const deltaX = landmark0.x - landmark3.x;
      const angle = -Math.atan2(deltaZ, deltaX); // theta, 단위: rad

      // Rotate the joystick model based on the calculated angle
      if (angle > 0.3 && angle < 3.0){ // 17도 이상 171도 이하 움직임 제한
        joystick.rotation.z = angle;
      }

      // Adjust camera only if it hasn't been adjusted yet
      if (!cameraAdjusted) {
        const box = new THREE.Box3().setFromObject(joystick);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());
        
        const halfSizeToFitOnScreen = boxSize * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(cameraRef.current.fov * 0.5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

        cameraRef.current.position.copy(boxCenter);
        cameraRef.current.position.z += distance * 1.5; // Add some distance for better view
        cameraRef.current.lookAt(boxCenter);
        cameraRef.current.updateProjectionMatrix();

        // Mark camera as adjusted
        setCameraAdjusted(true);
      }
    }
  }, [handLandmarks, cameraAdjusted]);

  return <div ref={mountRef} style={{ width: '320px', height: '240px' }} />;
};

export default ThreeScene;
