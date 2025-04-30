// src/components/ThreeBackground.jsx
import React, { useRef, useMemo, useEffect } from "react"; // Import useEffect
import { Canvas, useFrame } from "@react-three/fiber";
import { Torus } from "@react-three/drei"; // Using Torus for rings
import * as THREE from "three";

// Function to generate a random number in a range
const random = (min, max) => Math.random() * (max - min) + min;

// Component for a single ring in the tunnel
function TunnelRing({ positionZ, color }) {
  const ref = useRef();

  useFrame((state, delta) => {
    if (ref.current) {
      // Optional: Slowly rotate the rings
      ref.current.rotation.z += delta * 0.1;
    }
  });

  return (
    // Use Torus geometry for the ring
    // args: [radius, tubeRadius, radialSegments, tubularSegments]
    <Torus ref={ref} args={[3.5, 0.1, 16, 100]} position={[0, 0, positionZ]}>
      <meshStandardMaterial // Use StandardMaterial for lighting effects
        color={color}
        roughness={0.5}
        metalness={0.2}
        emissive={color} // Make it glow slightly
        emissiveIntensity={0.5}
      />
    </Torus>
  );
}

// Component to manage the tunnel effect
function FiberTunnel({ darkMode }) { // Accept darkMode prop
  const groupRef = useRef();
  const ringCount = 30; // Number of rings
  const ringSpacing = 3; // Spacing between rings

  // Generate ring data
  const rings = useMemo(() => {
    return Array.from({ length: ringCount }).map((_, i) => ({
      id: i,
      positionZ: -i * ringSpacing, // Position rings along negative Z
      // Adjust color based on darkMode
      color: darkMode
        ? new THREE.Color(`hsl(${220 + i * 4}, 70%, 40%)`) // Dark mode: Cooler, darker blues/purples
        : new THREE.Color(`hsl(${180 + i * 5}, 80%, 60%)`), // Light mode: Brighter blues/pinks
    }));
    // Add darkMode to dependency array so colors recalculate on theme change
  }, [ringCount, ringSpacing, darkMode]);

  useFrame((state, delta) => {
    // Move the camera forward continuously
    state.camera.position.z -= delta * 5; // Adjust speed (5)
    // Reset camera position if it goes too far
    if (state.camera.position.z < -(ringCount * ringSpacing - 10)) {
      state.camera.position.z = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring) => (
        <TunnelRing key={ring.id} {...ring} />
      ))}
    </group>
  );
}

// Accept darkMode prop
function ThreeBackground({ darkMode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }} // Start camera closer, wider FOV
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }} // Changed to fixed and zIndex -1
    >
      {/* Add some subtle lighting */}
      {/* Adjust ambient light based on darkMode */}
      <ambientLight intensity={darkMode ? 0.1 : 0.3} />
      <pointLight position={[0, 0, 10]} intensity={0.8} />
      <FiberTunnel darkMode={darkMode} /> {/* Pass darkMode down */}
    </Canvas>
  );
}

export default ThreeBackground; 