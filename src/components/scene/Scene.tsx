"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { HoloEnvironment } from "./Environment";
function CameraAnimator({ transmissionProgress }: { transmissionProgress: number }) {
  const { camera } = useThree();
  const targetZ = useRef(4.5);

  useFrame(() => {
    // Lerp camera toward avatar when transmission active
    const goal = transmissionProgress > 0.5 ? 2.2 : 4.5;
    targetZ.current += (goal - targetZ.current) * 0.04;
    camera.position.z = targetZ.current;

    // Slight upward drift during push-in
    const goalY = transmissionProgress > 0.5 ? 0.15 : 0;
    camera.position.y += (goalY - camera.position.y) * 0.04;
  });

  return null;
}

interface SceneProps {
  transmissionProgress?: number;
  onAvatarClick?: () => void;
}

export function Scene({ transmissionProgress = 0, onAvatarClick }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <CameraAnimator transmissionProgress={transmissionProgress} />
        <Avatar
          transmissionProgress={transmissionProgress}
          onClick={onAvatarClick}
        />
        <HoloEnvironment />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
