"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { HoloEnvironment } from "./Environment";

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
