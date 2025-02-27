import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ShapeConfig, Rotation } from '../types';
import RotatingObject from './RotatingObject';
import { generateRandomRotation } from '../utils/gameUtils';

interface SilhouetteOptionsProps {
  shape: ShapeConfig;
  onSelect: (rotation: Rotation) => void;
  disabled?: boolean;
}

const SilhouetteOptions: React.FC<SilhouetteOptionsProps> = ({ shape, onSelect, disabled = false }) => {
  const options = useMemo(() => {
    const correctRotation = generateRandomRotation();
    const rotations: Rotation[] = [correctRotation];

    // Generate 3 incorrect rotations
    for (let i = 0; i < 3; i++) {
      let newRotation: Rotation;
      do {
        newRotation = generateRandomRotation();
      } while (rotations.some(r => 
        r.every((value, index) => Math.abs(value - newRotation[index]) < 0.1)
      ));
      rotations.push(newRotation);
    }

    // Shuffle the rotations
    return rotations.sort(() => Math.random() - 0.5);
  }, [shape]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {options.map((rotation, index) => (
        <button
          key={index}
          onClick={() => !disabled && onSelect(rotation)}
          className={`
            relative w-full pb-[100%] bg-gray-800 rounded-lg overflow-hidden
            transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
          `}
          disabled={disabled}
        >
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 2, 5] }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={0.9} />
              <pointLight position={[-10, -10, -10]} intensity={0.4} />
              <RotatingObject
                shape={shape}
                rotation={rotation}
                speed={0}
                isSilhouette={true}
              />
            </Canvas>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SilhouetteOptions; 