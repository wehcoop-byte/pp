import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Stars, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// Small animated orb
function GlowOrb({ position = [0, 0, 0] as [number, number, number], color = "#F4953E" }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.3;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh ref={ref} position={position}>
        <Sphere args={[1.2, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.1}
          distort={0.25}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

// Soft background sphere
function Backdrop() {
  return (
    <mesh position={[0, 0, -6]}>
      <Sphere args={[8, 64, 64]} />
      <meshStandardMaterial color={"#50336a"} />
    </mesh>
  );
}

export default function HeroScene() {
  // Respect people who hate animations
  const reduced = typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className="interactive-card"
      style={{
        width: "100%",
        height: 420,
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 6], fov: 45 }}
        // keeps GPU cost sane on mobile
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["transparent"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Backdrop />
          {!reduced && (
            <>
              <GlowOrb position={[-1.8, 0.4, 0]} color="#F4953E" />
              <GlowOrb position={[1.6, -0.2, 0]} color="#a796c4" />
              <Stars radius={30} depth={40} count={1200} factor={3} fade />
            </>
          )}
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}
