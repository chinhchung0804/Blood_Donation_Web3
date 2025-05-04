import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function BloodAnimation() {
  // Tham chiếu đến nhóm chứa giọt máu chính
  const bloodRef = useRef<THREE.Group>(null);
  // Tham chiếu đến nhóm chứa các hạt lơ lửng
  const particlesRef = useRef<THREE.Group>(null);

  // Hook useFrame chạy mỗi khung hình để tạo hoạt ảnh
  useFrame((state) => {
    if (bloodRef.current) {
      // Xoay giọt máu chính theo trục Y
      bloodRef.current.rotation.y += 0.005;
      // Dao động nhẹ theo trục X dựa trên thời gian
      bloodRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }

    if (particlesRef.current) {
      // Cập nhật vị trí các hạt lơ lửng theo sóng sin
      particlesRef.current.children.forEach((particle, i) => {
        const y = Math.sin(state.clock.elapsedTime + i) * 0.2;
        particle.position.y = y;
      });
    }
  });

  return (
    <>
      {/* Nhóm chứa giọt máu chính */}
      <group ref={bloodRef}>
        {/* Hình cầu ngoài của giọt máu */}
        <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#dc2626" // Màu đỏ đậm
            roughness={0.2} // Độ nhám bề mặt
            metalness={0.8} // Độ bóng kim loại
            emissive="#dc2626" // Màu phát sáng
            emissiveIntensity={0.2} // Cường độ phát sáng
          />
        </Sphere>
        {/* Hình cầu trong của giọt máu, tạo hiệu ứng ánh sáng */}
        <Sphere args={[0.95, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ef4444" // Màu đỏ nhạt
            roughness={0.1} // Độ nhám thấp hơn
            metalness={0.9} // Độ bóng cao hơn
            transparent // Trong suốt
            opacity={0.6} // Độ trong suốt
          />
        </Sphere>
      </group>

      {/* Nhóm chứa các hạt lơ lửng */}
      <group ref={particlesRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Sphere
            key={i}
            args={[0.05, 16, 16]} // Kích thước nhỏ cho các hạt
            position={[
              Math.sin(i) * 2, // Vị trí X theo sóng sin
              Math.cos(i) * 2, // Vị trí Y theo sóng cos
              Math.sin(i * 0.5) * 2, // Vị trí Z
            ]}
          >
            <meshStandardMaterial
              color="#ef4444" // Màu đỏ nhạt
              emissive="#dc2626" // Phát sáng màu đỏ đậm
              emissiveIntensity={0.5} // Cường độ phát sáng
              transparent // Trong suốt
              opacity={0.8} // Độ trong suốt
            />
          </Sphere>
        ))}
      </group>

      {/* Ánh sáng cho cảnh 3D */}
      <pointLight position={[10, 10, 10]} intensity={1} /> {/* Đèn điểm chính */}
      <pointLight position={[-10, -10, -10]} intensity={0.5} /> {/* Đèn điểm phụ */}
      <ambientLight intensity={0.4} /> {/* Đèn môi trường */}
    </>
  );
}