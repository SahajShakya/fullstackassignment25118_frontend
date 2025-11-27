import { Mesh } from 'three';
import { useRef, useEffect } from 'react';

export function Ground() {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.receiveShadow = true;
    }
  }, []);

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        color="#2d2d2d" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}
