import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useState } from 'react';
import './App.css';

export default function App() {
  const [selectedColor, setSelectedColor] = useState('#ffffff');

  return (
    <div className="app-container">
      <div className="customization-panel">
        <h2>Customize Your Room</h2>
        <label>
          Wall Color:
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
          />
        </label>
      </div>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>
        <mesh position={[0, 1, -2]}>
          <boxGeometry args={[4, 2, 0.1]} />
          <meshStandardMaterial color={selectedColor} />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
