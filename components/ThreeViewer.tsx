import React, { useRef, Suspense, useEffect, useState, ReactNode, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { ProductShape } from '../types';

interface ThreeViewerProps {
  shape: ProductShape;
  textureImage: string; // Base64 data URI or URL
  objData?: string;
  autoRotate?: boolean;
}

// Custom OBJ Mesh Component
const CustomObjMesh: React.FC<{ url: string; material: THREE.Material }> = ({ url, material }) => {
  // useLoader will throw a promise if loading, handled by Suspense
  const obj = useLoader(OBJLoader, url);
  
  const clonedObj = useMemo(() => {
    // Clone to avoid modifying the cached object
    const clone = obj.clone();
    
    // Calculate bounding box to normalize size
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Scale to fit approx 3 units, avoid divide by zero
    const scale = maxDim > 0 ? 3 / maxDim : 1;
    
    clone.scale.setScalar(scale);

    // Re-center
    const newBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    newBox.getCenter(center);
    clone.position.sub(center);

    // Apply material
    clone.traverse((child: any) => {
      if (child.isMesh) {
        // If the OBJ has no UVs, texture mapping might look weird, but we apply it anyway
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    return clone;
  }, [obj, material]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return <primitive ref={groupRef} object={clonedObj} />;
};

// Reusable Mesh Logic
const BaseMesh: React.FC<{ shape: ProductShape; material: ReactNode }> = ({ shape, material }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  switch (shape) {
    case 'cylinder':
      return (
        <mesh ref={meshRef} castShadow receiveShadow>
          <cylinderGeometry args={[1, 1, 2.5, 32]} />
          {material}
        </mesh>
      );
    case 'sphere':
      return (
        <mesh ref={meshRef} castShadow receiveShadow>
          <sphereGeometry args={[1.3, 32, 32]} />
          {material}
        </mesh>
      );
    case 'plane':
      return (
        <mesh ref={meshRef} castShadow receiveShadow rotation={[-Math.PI / 4, 0, 0]}>
          <planeGeometry args={[3, 3]} />
          {material}
        </mesh>
      );
    case 'box':
    default:
      return (
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          {material}
        </mesh>
      );
  }
};

const ProductMesh: React.FC<{ shape: ProductShape; textureImage: string; objData?: string }> = ({ shape, textureImage, objData }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state when textureImage changes
    setIsLoading(true);
    setTexture(null);
    
    if (!textureImage) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    loader.load(
      textureImage,
      (loadedTexture) => {
        if (isMounted) {
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          setTexture(loadedTexture);
          setIsLoading(false);
        }
      },
      undefined,
      (err) => {
        if (isMounted) {
          console.warn(`ThreeViewer: Failed to load texture: ${textureImage}`, err);
          // Do not throw, just stop loading and show fallback
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [textureImage]);

  // Fallback material properties
  const materialProps = {
    map: texture,
    color: texture ? '#ffffff' : '#e2e8f0', // Light gray fallback
    roughness: 0.5,
    metalness: 0.1,
    side: THREE.DoubleSide,
    transparent: shape === 'plane' && !!texture, 
  };

  const material = new THREE.MeshStandardMaterial(materialProps);

  return (
    <group>
       {shape === 'custom' && objData ? (
          <CustomObjMesh url={objData} material={material} />
       ) : (
          <BaseMesh shape={shape} material={<meshStandardMaterial {...materialProps} />} />
       )}
       {isLoading && (
          <Html position={[0, 1.5, 0]} center>
            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-md whitespace-nowrap">
              Loading Texture...
            </div>
          </Html>
       )}
    </group>
  );
};

const Loader = () => (
  <Html center>
    <div className="text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm animate-pulse whitespace-nowrap text-sm font-medium">
      Loading Model...
    </div>
  </Html>
);

const ThreeViewer: React.FC<ThreeViewerProps> = ({ shape, textureImage, objData, autoRotate = false }) => {
  return (
    <div className="w-full h-full relative bg-gray-900 rounded-xl overflow-hidden shadow-inner">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.5, blur: 2 }}>
            <ProductMesh shape={shape} textureImage={textureImage} objData={objData} />
          </Stage>
          <OrbitControls 
            autoRotate={autoRotate} 
            autoRotateSpeed={1.5} 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.5} 
          />
          <Grid
            renderOrder={-1}
            position={[0, -1.5, 0]}
            infiniteGrid
            cellSize={0.6}
            sectionSize={3}
            fadeDistance={25}
            sectionColor="#4f4f4f"
            cellColor="#2f2f2f"
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay Controls Info */}
      <div className="absolute bottom-4 left-4 text-xs text-white/50 pointer-events-none select-none">
        <p>Left Click: Rotate • Right Click: Pan • Scroll: Zoom</p>
      </div>
    </div>
  );
};

export default ThreeViewer;