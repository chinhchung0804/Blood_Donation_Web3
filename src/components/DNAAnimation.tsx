import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function DNAAnimation() {
  const dnaRef = useRef<THREE.Group>(null);
  const spheresRef = useRef<THREE.Mesh[]>([]);

  // Animation logic for DNA movement and sphere heartbeat effect
  useFrame((state: { clock: { elapsedTime: number } }) => {
    if (dnaRef.current) {
      const time = state.clock.elapsedTime;
      dnaRef.current.position.x = Math.sin(time) * 5; // Move along the X-axis
      dnaRef.current.position.y = Math.cos(time) * 3; // Move along the Y-axis (diagonal)
      dnaRef.current.rotation.y += 0.02; // Faster rotation around the Y-axis
    }

    // Heartbeat effect for each sphere
    spheresRef.current.forEach((sphere, index) => {
      const heartbeatTime = state.clock.elapsedTime + index * 0.2; // Offset heartbeat for each sphere
      const scale = 1 + 0.3 * Math.sin(heartbeatTime * 2); // Scale for heartbeat effect
      sphere.scale.set(scale, scale, scale);

      // Glow effect using emissive intensity
      const material = sphere.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + 0.5 * Math.sin(heartbeatTime); // Simulate glow
    });
  });

  const strandCount = 40; // Total number of base pairs
  const twistRate = 0.4; // Adjusts the degree of the helix twist
  const helixHeight = 0.3; // Distance between base pairs

  return (
    <group ref={dnaRef}>
      {/* Generate the double helix structure */}
      {Array.from({ length: strandCount }).map((_, i) => (
        <React.Fragment key={i}>
          {/* First strand sphere (red with glow) */}
          <group>
            <Sphere
              args={[0.1, 16, 16]}
              position={[
                Math.sin(i * twistRate) * 1.5, // X position
                i * helixHeight - strandCount * helixHeight * 0.5, // Y position
                Math.cos(i * twistRate) * 1.5, // Z position
              ]}
              ref={(ref: THREE.Mesh) => {
                if (ref) spheresRef.current[i * 2] = ref; // Store reference for first sphere
              }}
            >
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ff0000"
                emissiveIntensity={0.5}
                toneMapped={false}
              />
            </Sphere>
            {/* Glow layer */}
            <Sphere
              args={[0.15, 16, 16]}
              position={[
                Math.sin(i * twistRate) * 1.5,
                i * helixHeight - strandCount * helixHeight * 0.5,
                Math.cos(i * twistRate) * 1.5,
              ]}
            >
              <meshStandardMaterial
                color="#ff0000"
                transparent
                opacity={0.3}
                emissive="#ff0000"
                emissiveIntensity={0.5}
                toneMapped={false}
              />
            </Sphere>
          </group>

          {/* Second strand sphere (red with glow) */}
          <group>
            <Sphere
              args={[0.1, 16, 16]}
              position={[
                Math.sin(i * twistRate + Math.PI) * 1.5, // Opposite X position
                i * helixHeight - strandCount * helixHeight * 0.5, // Y position
                Math.cos(i * twistRate + Math.PI) * 1.5, // Opposite Z position
              ]}
              ref={(ref: THREE.Mesh) => {
                if (ref) spheresRef.current[i * 2 + 1] = ref; // Store reference for second sphere
              }}
            >
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ff0000"
                emissiveIntensity={0.5}
                toneMapped={false}
              />
            </Sphere>
            {/* Glow layer */}
            <Sphere
              args={[0.15, 16, 16]}
              position={[
                Math.sin(i * twistRate + Math.PI) * 1.5,
                i * helixHeight - strandCount * helixHeight * 0.5,
                Math.cos(i * twistRate + Math.PI) * 1.5,
              ]}
            >
              <meshStandardMaterial
                color="#ff0000"
                transparent
                opacity={0.3}
                emissive="#ff0000"
                emissiveIntensity={0.5}
                toneMapped={false}
              />
            </Sphere>
          </group>
        </React.Fragment>
      ))}

      {/* Lighting for better visualization */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} />
    </group>
  );
}