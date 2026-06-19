import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

[
  "/model6.glb",
  "/model2.glb",
  "/model3.glb",
  "/model1.glb",
  "/model61.glb",
  "/model21.glb",
].forEach((modelPath) => {
  useGLTF.preload(modelPath);
});

function Model({ modelPath, scale, position }) {
  const modelRef = useRef();
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    if (!scene || !modelRef.current) return;

    let animationFrameId;
    let timeoutId;
    let isMounted = true;

    // Improve material brightness
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissiveIntensity = 2;
        child.material.metalness = 0.2;
        child.material.roughness = 0.4;
      }
    });

    const initialYRotation = Math.PI / 3; 
    modelRef.current.rotation.set(1, initialYRotation, 0);

    let start = performance.now();
    const duration = 3100; // 3s rotation
    const delay = 2000; // 2s pause

    const loop = () => {
      if (!isMounted || !modelRef.current) return;
      start = performance.now();

      const animate = (time) => {
        if (!isMounted || !modelRef.current) return;
        const elapsed = time - start;

        if (elapsed < duration) {
          const rotationAngle = (Math.PI * 2 * elapsed) / duration; // full spin in 3s
          modelRef.current.rotation.y = rotationAngle;
          animationFrameId = requestAnimationFrame(animate);
        } else {
          modelRef.current.rotation.y = Math.PI * 2;
          timeoutId = setTimeout(() => {
            if (!isMounted || !modelRef.current) return;
            modelRef.current.rotation.y = 0; // reset rotation
            loop(); // start again
          }, delay);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    };

    loop(); // initial call

    // Optional cleanup (good practice)
    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [scene]);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={scale}
      position={position}
    />
  );
}

export default function ThreeModel({
  modelPath,
  scale = 1.5,
  position = [0, 0, 0],
}) {
  return (
    <Canvas style={{ width: "100%", height: "100%" }} camera={{ position: [0, 0, 5] }}>
      {/* Enhanced lighting */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={2.4} />
      <Model modelPath={modelPath} scale={scale} position={position} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
