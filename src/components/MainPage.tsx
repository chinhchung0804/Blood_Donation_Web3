import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Heart, Calendar, Phone, ArrowRight, Clock } from 'lucide-react';
import { BloodAnimation } from './BloodAnimation';
import { FooterAnimation } from './FooterAnimation';
import { DNAAnimation } from './DNAAnimation';
import '../styles/animation.css';
import Navbar from './Navbar';

interface MainPageProps {
  isSidebarExpanded: boolean;
  theme: 'light' | 'dark';
}

function MainPage({ isSidebarExpanded, theme }: MainPageProps) {
  const navigate = useNavigate();
  const [animateText, setAnimateText] = useState(false);
  const [highlightText, setHighlightText] = useState(false);
  const [bloodDrops, setBloodDrops] = useState<
    Array<{ id: number; left: number; delay: number; duration: number }>
  >([]);
  const [showRipple, setShowRipple] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setAnimateText(true);
    const highlightTimer = setTimeout(() => {
      setHighlightText(true);
      const revertTimer = setTimeout(() => {
        setHighlightText(false);
      }, 5000);
      return () => clearTimeout(revertTimer);
    }, 4000);
    return () => clearTimeout(highlightTimer);
  }, []);

  useEffect(() => {
    const generateBloodDrops = () => {
      const newDrops = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 5,
      }));
      setBloodDrops(newDrops);
    };
    generateBloodDrops();
    window.addEventListener('load', generateBloodDrops);
    return () => window.removeEventListener('load', generateBloodDrops);
  }, []);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, path: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setShowRipple({ x, y });
    setTimeout(() => navigate(path), 300);
  };

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gradient-to-b from-gray-900 via-red-900 to-black' : 'bg-gradient-to-b from-gray-100 via-red-200 to-white'
    }`}>
      {/* Navbar */}
      <Navbar onThemeChange={() => {}} theme={theme} />

      {/* Animated Blood Drops Background */}
      <div className="absolute inset-0 pointer-events-none">
        {bloodDrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute w-4 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-b-full rounded-t-[40%] opacity-70 animate-blood-drop"
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
              transform: 'translateZ(0)',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full">
        {/* Hero Section */}
        <div className={`relative h-[600px] flex items-center transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-red-900' : 'bg-gradient-to-b from-gray-200 to-red-200'
        }`}>
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <OrbitControls enableZoom={false} enablePan={false} />
              <BloodAnimation />
              <DNAAnimation />
            </Canvas>
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div
              className={`max-w-2xl text-center mx-auto transition-opacity duration-[4000ms] transform ${
                animateText ? 'opacity-100' : 'opacity-0'
              } ${theme === 'dark' ? 'text-white' : 'text-black'}`}
            >
              <h1
                className={`text-5xl font-bold mb-6 transition-colors ${
                  highlightText ? 'text-red-600 neon-text animate-heartbeat-text' : theme === 'dark' ? 'text-white' : 'text-black'
                }`}
              >
                Mỗi Giọt Máu Là Một Hành Động Anh Hùng.
              </h1>
              <p className={`text-xl mb-8 transition-colors ${
                theme === 'dark' ? 'text-gray-300 hover:text-gray-200' : 'text-gray-700 hover:text-gray-900'
              }`}>
                Máu của bạn có thể cứu được ba mạng sống. Tham gia sứ mệnh của chúng tôi để tạo nên sự khác biệt.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="relative">
                  <button
                    className={`px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 ${
                      theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-400 hover:bg-red-500 text-white'
                    }`}
                    onClick={(e) => handleButtonClick(e, '/donate')}
                  >
                    Quyên Góp Ngay <ArrowRight className="w-5 h-5" />
                  </button>
                  {showRipple && (
                    <span
                      className="absolute rounded-full bg-red-500 opacity-50 animate-ripple"
                      style={{
                        left: showRipple.x,
                        top: showRipple.y,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Donate Blood Section */}
        <div className={`py-16 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-gradient-to-b from-white to-gray-200'
        }`}>
          <div className="container mx-auto px-6">
            <h2
              className={`text-3xl font-bold text-center mb-6 transition-colors ${
                highlightText
                  ? 'text-red-600 neon-text animate-heartbeat-text'
                  : theme === 'dark'
                  ? 'text-white hover:text-red-500'
                  : 'text-black hover:text-red-400'
              }`}
            >
              Tại Sao Nên Quyên Góp Máu?
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 text-center transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              <div>
                <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3
                  className={`text-xl font-semibold mb-2 transition-colors ${
                    highlightText
                      ? 'text-red-600 neon-text animate-heartbeat-text'
                      : theme === 'dark'
                      ? 'hover:text-red-500'
                      : 'hover:text-red-400'
                  }`}
                >
                  Cứu Sống Mạng Người
                </h3>
                <p className={`pl-12 pr-8 transition-colors ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                }`}>
                  Một lần quyên góp có thể cứu được ba mạng sống và giúp đỡ nhiều người khác.
                </p>
              </div>
              <div>
                <Clock className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3
                  className={`text-xl font-semibold mb-2 transition-colors ${
                    highlightText
                      ? 'text-red-600 neon-text animate-heartbeat-text'
                      : theme === 'dark'
                      ? 'hover:text-red-500'
                      : 'hover:text-red-400'
                  }`}
                >
                  Nhanh Chóng & Dễ Dàng
                </h3>
                <p className={`transition-colors ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                }`}>
                  Quá trình quyên góp chỉ mất chưa đến một giờ của bạn.
                </p>
              </div>
              <div>
                <Calendar className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3
                  className={`text-xl font-semibold mb-2 transition-colors ${
                    highlightText
                      ? 'text-red-600 neon-text animate-heartbeat-text'
                      : theme === 'dark'
                      ? 'hover:text-red-500'
                      : 'hover:text-red-400'
                  }`}
                >
                  Nhu Cầu Thường Xuyên
                </h3>
                <p className={`transition-colors ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                }`}>
                  Máu luôn cần thiết mỗi ngày cho phẫu thuật, điều trị và các trường hợp khẩn cấp.
                </p>
              </div>
            </div>
            <div className="text-center mt-8">
              <div className="relative">
                <button
                  className={`px-6 py-3 font-bold text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white'
                      : 'bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white'
                  }`}
                  onClick={(e) => handleButtonClick(e, '/campaign')}
                >
                  Xem Các Chiến Dịch
                </button>
                {showRipple && (
                  <span
                    className="absolute rounded-full bg-red-500 opacity-50 animate-ripple"
                    style={{
                      left: showRipple.x,
                      top: showRipple.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`py-16 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gradient-to-b from-red-900 to-black' : 'bg-gradient-to-b from-red-200 to-gray-100'
        }`}>
          <div className="container mx-auto px-6 text-center">
            <h2
              className={`text-3xl font-bold mb-6 transition-colors ${
                highlightText
                  ? 'text-red-600 neon-text animate-heartbeat-text'
                  : theme === 'dark'
                  ? 'text-white hover:text-red-500'
                  : 'text-black hover:text-red-400'
              }`}
            >
              Bạn Sẵn Sàng Tạo Nên Sự Khác Biệt Chưa?
            </h2>
            <p className={`text-xl mb-8 max-w-2xl mx-auto transition-colors ${
              theme === 'dark' ? 'text-gray-300 hover:text-gray-200' : 'text-gray-700 hover:text-gray-900'
            }`}>
              Lên lịch quyên góp máu ngay hôm nay. Chỉ mất vài phút để đăng ký.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="relative">
                <button
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 flex items-center gap-2 justify-center ${
                    theme === 'dark'
                      ? 'bg-white text-red-600 hover:bg-gray-100'
                      : 'bg-gray-800 text-red-400 hover:bg-gray-900'
                  }`}
                  onClick={(e) => handleButtonClick(e, '/donate')}
                >
                  Đặt Lịch Quyên Góp <Calendar className="w-5 h-5" />
                </button>
                {showRipple && (
                  <span
                    className="absolute rounded-full bg-red-500 opacity-50 animate-ripple"
                    style={{
                      left: showRipple.x,
                      top: showRipple.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
              <div className="relative">
                <button
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 flex items-center gap-2 justify-center ${
                    theme === 'dark'
                      ? 'bg-white text-red-600 hover:bg-gray-100'
                      : 'bg-gray-800 text-red-400 hover:bg-gray-900'
                  }`}
                  onClick={(e) => handleButtonClick(e, '/contact')}
                >
                  Liên Hệ Chúng Tôi <Phone className="w-5 h-5" />
                </button>
                {showRipple && (
                  <span
                    className="absolute rounded-full bg-red-500 opacity-50 animate-ripple"
                    style={{
                      left: showRipple.x,
                      top: showRipple.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`relative py-12 overflow-hidden transition-colors duration-300 ${
          theme === 'dark' ? 'bg-black text-white' : 'bg-gray-200 text-black'
        }`}>
          <div className="absolute inset-0 h-48">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <FooterAnimation />
            </Canvas>
          </div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <p className={`text-xl font-semibold mb-4 hover:text-red-500 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              Trung Tâm Quyên Góp Máu
            </p>
            <p className={`transition-colors ${
              theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
            }`}>
              Cùng nhau, chúng ta tạo nên sự khác biệt.
            </p>
            <p className={`mt-6 transition-colors ${
              theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
            }`}>
              © 2025 Trung Tâm Quyên Góp Máu. Bản quyền thuộc về chúng tôi.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default MainPage;