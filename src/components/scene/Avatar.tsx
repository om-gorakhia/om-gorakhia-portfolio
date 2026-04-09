"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { hologramVertexShader, hologramFragmentShader } from "@/shaders/hologram";

interface AvatarProps {
  transmissionProgress?: number;
  onClick?: () => void;
}

export function Avatar({ transmissionProgress = 0, onClick }: AvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const [cleanTex, duotoneTex, depthTex] = useTexture([
    "/avatar/selfie_clean.png",
    "/avatar/selfie_duotone.png",
    "/avatar/selfie_depth.png",
  ]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTexture: { value: cleanTex },
      uDuotone: { value: duotoneTex },
      uDepthMap: { value: depthTex },
      uAccentColor: { value: new THREE.Color("#A855F7") },
      uTransmissionProgress: { value: 0 },
    }),
    [cleanTex, duotoneTex, depthTex]
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;

    material.uniforms.uTime.value += delta;
    material.uniforms.uTransmissionProgress.value = transmissionProgress;

    // Smooth mouse follow
    const targetX = (state.pointer.x * viewport.width) / 2;
    const targetY = (state.pointer.y * viewport.height) / 2;
    mouseRef.current.x += (targetX - mouseRef.current.x) * 0.05;
    mouseRef.current.y += (targetY - mouseRef.current.y) * 0.05;
    material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

    // Subtle ambient rotation
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.01;
  });

  // Aspect ratio of the selfie (896x1152)
  const aspect = 896 / 1152;
  const height = 3.2;
  const width = height * aspect;

  return (
    <mesh
      ref={meshRef}
      onClick={onClick}
      position={[0, 0.2, 0]}
    >
      <planeGeometry args={[width, height, 64, 64]} />
      <shaderMaterial
        vertexShader={hologramVertexShader}
        fragmentShader={hologramFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
