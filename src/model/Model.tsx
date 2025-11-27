import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { Mesh, Box3, Vector3, AnimationMixer } from 'three';
import { GLTFLoader } from 'three-stdlib';

interface ModelProps {
  glbUrl: string;
  position: [number, number];
  scale?: [number, number, number];
  entranceOrder?: number;
  onDragEnd?: (newPosition: [number, number]) => void;
}

export function Model({ glbUrl, position, onDragEnd }: ModelProps) {
  const meshRef = useRef<Mesh>(null);
  const gltf = useLoader(GLTFLoader, glbUrl);
  const [isDragging, setIsDragging] = useState(false);
  const animationMixerRef = useRef<AnimationMixer | null>(null);
  const animationPlayedRef = useRef(false);

  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone();
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf.scene]);

  const normalizedScale = useMemo(() => {
    const box = new Box3().setFromObject(clonedScene);
    const size = new Vector3();
    box.getSize(size);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 2;
    const scaleMultiplier = maxDim > 0 ? targetSize / maxDim : 1;
  
    return scaleMultiplier;
  }, [clonedScene]);

  const baseScale: number = normalizedScale * 0.3;

  const convert2DTo3D = (imagePos: [number, number]): [number, number, number] => {
    const x3d = (imagePos[0] / 800) * 8 - 4;
    const z3d = (imagePos[1] / 600) * 6 - 3;
    return [x3d, 0.2, z3d];
  };

  const convert3DTo2D = useCallback((pos3d: [number, number, number]): [number, number] => {
    const imageX = ((pos3d[0] + 4) / 8) * 800;
    const imageY = ((pos3d[2] + 3) / 6) * 600;
    return [Math.round(imageX), Math.round(imageY)];
  }, []);

  const position3D = convert2DTo3D(position);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position3D[0], position3D[1], position3D[2]);
      meshRef.current.scale.set(baseScale, baseScale, baseScale);

      if (!animationPlayedRef.current && gltf.animations && gltf.animations.length > 0) {
        const mixer = new AnimationMixer(meshRef.current);
        animationMixerRef.current = mixer;
                gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
        
        animationPlayedRef.current = true;
      }
    }
  }, [baseScale, position3D, gltf.animations]);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  useFrame(() => {
    if (animationMixerRef.current) {
      animationMixerRef.current.update(0.016); // ~60fps
    }
  });

  useEffect(() => {
    if (!isDragging) return;

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      if (!meshRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const scale = Math.tan(Math.PI / 6);
      const worldX = x * scale * 8;
      const worldZ = y * scale * 6;

      meshRef.current.position.x = worldX;
      meshRef.current.position.z = worldZ;
    };

    const handleUp = () => {
      setIsDragging(false);
      if (onDragEnd && meshRef.current) {
        const newPos2D = convert3DTo2D([
          meshRef.current.position.x,
          meshRef.current.position.y,
          meshRef.current.position.z,
        ]);
        onDragEnd(newPos2D);
      }
    };

    canvas.addEventListener('pointermove', handleMove as EventListener);
    canvas.addEventListener('pointerup', handleUp);
    canvas.addEventListener('pointerleave', handleUp);

    return () => {
      canvas.removeEventListener('pointermove', handleMove as EventListener);
      canvas.removeEventListener('pointerup', handleUp);
      canvas.removeEventListener('pointerleave', handleUp);
    };
  }, [isDragging, onDragEnd, convert3DTo2D]);

  return (
    <mesh
      ref={meshRef}
      onPointerDown={handlePointerDown}
      castShadow
      receiveShadow
    >
      <primitive object={clonedScene} />
    </mesh>
  );
}
