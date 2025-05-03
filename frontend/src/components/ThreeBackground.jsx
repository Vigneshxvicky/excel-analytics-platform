// src/components/ThreeBackground.jsx
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
// import * as THREE from "three";

// Function to generate a random number in a range
const random = (min, max) => Math.random() * (max - min) + min;

// Component for the floating particles
function FloatingParticles({ count = 5000, darkMode }) {
  const pointsRef = useRef();

  // Generate random positions for particles within a sphere
  const particles = useMemo(() => {
    const temp = [];
    const radius = 50; // Radius of the sphere containing particles
    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(Math.random()); // Distribute more evenly within the sphere volume
      const theta = random(0, 2 * Math.PI);
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count]);

  // Determine particle color based on dark mode
  const particleColor = useMemo(() => {
    // Using slightly different colors for better visibility maybe
    return darkMode ? "#6fa8dc" : "#ffabab"; // Adjusted blue for dark, pink/red for light
  }, [darkMode]);

  useFrame((state, delta) => {
    // Slowly rotate the entire particle system
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={particleColor}
        size={0.06} // Slightly larger size
        sizeAttenuation={true} // Make particles smaller further away
        depthWrite={false} // Prevents rendering issues with transparency
      />
    </Points>
  );
}

// Accept darkMode prop
function ThreeBackground({ darkMode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }} // Camera position might need adjustment based on particle distribution
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }} // Ensure it's behind other content
    >
      {/* Ambient light helps illuminate the particles slightly */}
      <ambientLight intensity={darkMode ? 0.2 : 0.5} />
      <FloatingParticles darkMode={darkMode} count={6000} /> {/* Increased count slightly */}
    </Canvas>
  );
}
export default ThreeBackground;
