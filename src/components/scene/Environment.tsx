"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function HoloEnvironment() {
  const particlesRef = useRef<THREE.Points>(null);

  // Floating particles around the avatar
  const particleCount = 60;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1;
    sizes[i] = Math.random() * 2 + 0.5;
  }

  useFrame((state) => {
    if (!particlesRef.current) return;
    const positions = particlesRef.current.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      const y = positions.getY(i);
      positions.setY(
        i,
        y + Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.001
      );
    }
    positions.needsUpdate = true;
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <>
      {/* Ambient volumetric light cone */}
      <spotLight
        position={[0, 5, 3]}
        angle={0.5}
        penumbra={1}
        intensity={0.8}
        color="#A855F7"
        distance={12}
      />
      <ambientLight intensity={0.15} color="#C084FC" />

      {/* Floating accent particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color="#C084FC"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Ground reflection plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color="#05060A"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.5}
        />
      </mesh>
    </>
  );
}
