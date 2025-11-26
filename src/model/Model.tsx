import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import { Mesh, Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';

interface ModelProps {
  glbUrl: string;
  position: [number, number];
  entranceOrder?: number;
  modelIndex?: number;
  onDragEnd?: (newPosition: [number, number]) => void;
}

export function Model({ glbUrl, position, entranceOrder = 0, modelIndex = 0, onDragEnd }: ModelProps) {
  const meshRef = useRef<Mesh>(null);
  const gltf = useLoader(GLTFLoader, glbUrl);
  const [isDragging, setIsDragging] = useState(false);
  const animationStartTimeRef = useRef<number | null>(null);

  // Animation timing (in milliseconds)
  const ANIMATION_DELAY = entranceOrder * 300; // Stagger animations by 300ms each
  const ANIMATION_DURATION = 800; // 800ms to move and scale up

  // Clone the scene for each model instance to avoid reusing geometry
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

  // Auto-normalize model size based on bounding box
  const normalizedScale = useMemo(() => {
    const box = new Box3().setFromObject(clonedScene);
    const size = new Vector3();
    box.getSize(size);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 2;
    const scaleMultiplier = maxDim > 0 ? targetSize / maxDim : 1;
    
    console.log(`Model ${modelIndex} normalization:`, { maxDim, scaleMultiplier });
    return scaleMultiplier;
  }, [clonedScene, modelIndex]);

  const baseScale: number = normalizedScale * 0.3;

  // Convert 2D image coordinates to 3D world coordinates
  const convert2DTo3D = useCallback((imagePos: [number, number]): [number, number, number] => {
    const x3d = (imagePos[0] / 800) * 8 - 4;
    const z3d = (imagePos[1] / 600) * 6 - 3;
    return [x3d, 0.2, z3d];
  }, []);

  // Convert 3D coordinates back to 2D image coordinates
  const convert3DTo2D = useCallback((pos3d: [number, number, number]): [number, number] => {
    const imageX = ((pos3d[0] + 4) / 8) * 800;
    const imageY = ((pos3d[2] + 3) / 6) * 600;
    return [Math.round(imageX), Math.round(imageY)];
  }, []);

  // Set initial position and animate entrance
  useEffect(() => {
    if (!meshRef.current) return;

    // Initialize start time on first mount
    if (animationStartTimeRef.current === null) {
      animationStartTimeRef.current = Date.now();
    }

    // Animate position and scale from corner to final position
    const animate = () => {
      if (!meshRef.current) return;

      const now = Date.now();
      const elapsedTime = now - (animationStartTimeRef.current || 0);
      
      // Wait for animation delay (stagger effect)
      if (elapsedTime < ANIMATION_DELAY) {
        // During delay, start at corner (top-left) with tiny scale
        meshRef.current.position.set(-4, 0.2, -3); // Top-left corner
        meshRef.current.scale.set(0, 0, 0); // Start invisible
        requestAnimationFrame(animate);
        return;
      }

      // Calculate progress after delay
      const animationElapsed = elapsedTime - ANIMATION_DELAY;
      const progress = Math.min(animationElapsed / ANIMATION_DURATION, 1);

      // Final 3D position
      const finalPos = convert2DTo3D(position);
      
      // Ease-out animation (cubic easing for smooth deceleration)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Animate from corner to final position
      meshRef.current.position.set(
        -4 + (finalPos[0] + 4) * easeProgress, // Interpolate X from -4 to final
        0.2,
        -3 + (finalPos[2] + 3) * easeProgress  // Interpolate Z from -3 to final
      );

      // Animate scale from tiny to base scale
      const animatedScale = baseScale * easeProgress;
      meshRef.current.scale.set(animatedScale, animatedScale, animatedScale);

      // Continue animation until complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete, set final values
        meshRef.current.position.set(finalPos[0], finalPos[1], finalPos[2]);
        meshRef.current.scale.set(baseScale, baseScale, baseScale);
      }
    };

    animate();
  }, [baseScale, position, modelIndex, convert2DTo3D, ANIMATION_DELAY, ANIMATION_DURATION]);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  // Add event listeners
  useEffect(() => {
    if (!isDragging) return;

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      if (!meshRef.current) return;

      const rect = canvas.getBoundingClientRect();
      // Map canvas coordinates to image coordinates (0-800, 0-600)
      const imageX = (e.clientX - rect.left) / rect.width * 800;
      const imageY = (e.clientY - rect.top) / rect.height * 600;

      // Convert image coordinates to 3D world coordinates
      const x3d = (imageX / 800) * 8 - 4;
      const z3d = (imageY / 600) * 6 - 3;

      meshRef.current.position.x = x3d;
      meshRef.current.position.z = z3d;
    };

    const handleUp = () => {
      setIsDragging(false);
      if (onDragEnd && meshRef.current) {
        const newPos2D = convert3DTo2D([
          meshRef.current.position.x,
          meshRef.current.position.y,
          meshRef.current.position.z,
        ]);
        console.log('Model dropped at 2D position:', newPos2D);
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
