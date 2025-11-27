import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Sphere } from "@react-three/drei";
import * as THREE from "three";

function SwirlBlob({ color = "#F4953E" }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.003;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.4) * 0.2;
  });
  return (
    <Float floatIntensity={1.2} speed={1.2} rotationIntensity={0.5}>
      <Sphere ref={ref} args={[1.2, 64, 64]}>
        <meshStandardMaterial roughness={0.25} metalness={0.4} color={color} />
      </Sphere>
    </Float>
  );
}

function Dust() {
  const count = 120;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i*3+0] = (Math.random()-0.5)*14;
    positions[i*3+1] = (Math.random()-0.5)*8;
    positions[i*3+2] = (Math.random()-0.5)*12;
  }
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#FFFAFF" transparent opacity={0.15} />
    </points>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 4], fov: 55 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={0.9} color="#F4953E" />
        <Suspense fallback={null}>
          <SwirlBlob color="#F4953E" />
          <Dust />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
