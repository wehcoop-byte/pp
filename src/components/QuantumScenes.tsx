/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Props for a simple animated quantum-like particle
type QuantumParticleProps = {
  position: [number, number, number];
  color: string;
  scale?: number;
};

// Simple animated quantum-like particle using core three.js primitives
const QuantumParticle: React.FC<QuantumParticleProps> = ({
  position,
  color,
  scale = 1,
}) => {
  const ref = useRef<THREE.Mesh | null>(null);

  console.log('QuantumParticle mounted at', position);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();

    console.log('QuantumParticle tick', {
      time: t,
      position: ref.current.position.toArray(),
      rotation: ref.current.rotation.toArray(),
    });

    ref.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.2;
    ref.current.rotation.x = t * 0.5;
    ref.current.rotation.z = t * 0.3;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
    </mesh>
  );
};

// Large torus acting as a macroscopic wave backdrop
const MacroscopicWave: React.FC = () => {
  const ref = useRef<THREE.Mesh | null>(null);

  console.log('MacroscopicWave mounted');

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();

    console.log('MacroscopicWave tick', {
      time: t,
      rotation: ref.current.rotation.toArray(),
    });

    ref.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    ref.current.rotation.y = t * 0.1;
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[3, 0.1, 16, 100]} />
      <meshStandardMaterial
        color="#C5A059"
        emissive="#C5A059"
        emissiveIntensity={0.5}
        transparent
        opacity={0.6}
        wireframe
      />
    </mesh>
  );
};

// 3D hero background scene
export const HeroScene: React.FC = () => {
  console.log('HeroScene mounted');

  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
      {console.log('HeroScene render start')}
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        {console.log('HeroScene Canvas mounted')}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          {console.log('HeroScene Float group 1 render')}
          <QuantumParticle position={[0, 0, 0]} color="#4F46E5" scale={1.2} />
          <MacroscopicWave />
        </Float>

        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          {console.log('HeroScene Float group 2 render')}
          <QuantumParticle position={[-3, 1, -2]} color="#9333EA" scale={0.5} />
          <QuantumParticle position={[3, -1, -3]} color="#C5A059" scale={0.6} />
        </Float>

        <Environment preset="city" />
        <Stars
          radius={100}
          depth={50}
          count={1000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      </Canvas>
    </div>
  );
};

// 3D quantum computer / cryostat scene
export const QuantumComputerScene: React.FC = () => {
  console.log('QuantumComputerScene mounted');

  return (
    <div className="w-full h-full absolute inset-0">
      {console.log('QuantumComputerScene render start')}
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        {console.log('QuantumComputerScene Canvas mounted')}
        <ambientLight intensity={1} />
        <spotLight
          position={[5, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          color="#C5A059"
        />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <Environment preset="studio" />

        <Float rotationIntensity={0.4} floatIntensity={0.2} speed={1}>
          {console.log('QuantumComputerScene Float render')}
          <group rotation={[0, 0, 0]} position={[0, 0.5, 0]}>
            {console.log('QuantumComputerScene group render')}

            {/* Top Plate */}
            <mesh position={[0, 1, 0]}>
              {console.log('Render: Top Plate')}
              <cylinderGeometry args={[1.2, 1.2, 0.1, 64]} />
              <meshStandardMaterial
                color="#C5A059"
                metalness={1}
                roughness={0.15}
              />
            </mesh>

            {/* Middle Stage */}
            <mesh position={[0, 0.2, 0]}>
              {console.log('Render: Middle Stage')}
              <cylinderGeometry args={[1, 1, 0.1, 64]} />
              <meshStandardMaterial
                color="#C5A059"
                metalness={1}
                roughness={0.15}
              />
            </mesh>

            {/* Bottom Stage */}
            <mesh position={[0, -0.6, 0]}>
              {console.log('Render: Bottom Stage')}
              <cylinderGeometry args={[0.6, 0.6, 0.1, 64]} />
              <meshStandardMaterial
                color="#C5A059"
                metalness={1}
                roughness={0.15}
              />
            </mesh>

            {/* Connecting Rods */}
            <mesh position={[0.5, 0.6, 0]}>
              {console.log('Render: Connecting Rod 1')}
              <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
              <meshStandardMaterial
                color="#D1D5DB"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[-0.5, 0.6, 0]}>
              {console.log('Render: Connecting Rod 2')}
              <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
              <meshStandardMaterial
                color="#D1D5DB"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 0.6, 0.5]}>
              {console.log('Render: Connecting Rod 3')}
              <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
              <meshStandardMaterial
                color="#D1D5DB"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 0.6, -0.5]}>
              {console.log('Render: Connecting Rod 4')}
              <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
              <meshStandardMaterial
                color="#D1D5DB"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Coils/Wires - Copper colored */}
            <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.7, 0.015, 16, 64]} />
              <meshStandardMaterial
                color="#B87333"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.3, 0.015, 16, 64]} />
              <meshStandardMaterial
                color="#B87333"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>

            {/* Central processor chip simulation at bottom */}
            <mesh position={[0, -0.7, 0]}>
              <boxGeometry args={[0.2, 0.05, 0.2]} />
              <meshStandardMaterial
                color="#111111"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </group>
        </Float>
      </Canvas>
    </div>
  );
};


