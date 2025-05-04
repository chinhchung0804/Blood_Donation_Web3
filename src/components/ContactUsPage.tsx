import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Heart, Facebook, Twitter, Instagram, Droplet, CheckCircle } from 'lucide-react';
import '../styles/animation.css';

interface ContactUsPageProps {
  isSidebarExpanded: boolean;
  theme: 'light' | 'dark'; // Thêm theme vào props
}

interface FormData {
  name: string;
  email: string;
  message: string;
}

function ContactUsPage({ isSidebarExpanded, theme }: ContactUsPageProps) {
  const [bloodDrops, setBloodDrops] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);
  const [showRipple, setShowRipple] = useState<{ x: number; y: number } | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Generate blood drops on component mount
  useEffect(() => {
    const generateBloodDrops = () => {
      const newDrops = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 5,
        size: Math.random() * 30 + 20,
      }));
      setBloodDrops(newDrops);
    };

    generateBloodDrops();
    window.addEventListener("load", generateBloodDrops);
    return () => window.removeEventListener("load", generateBloodDrops);
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Validate and handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên của bạn.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email của bạn.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email không hợp lệ.');
      return;
    }
    if (!formData.message.trim()) {
      setError('Vui lòng nhập tin nhắn của bạn.');
      return;
    }

    // Ripple effect
    const button = e.currentTarget.querySelector('button[type="submit"]');
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;
      setShowRipple({ x, y });
    }

    // Simulate form submission
    setTimeout(() => {
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' }); // Reset form
    }, 300);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black' : 'bg-gray-100'
    }`}>
      {/* Animated Blood Drops */}
      <div className="absolute inset-0 pointer-events-none">
        {bloodDrops.map((drop) => (
          <div
            key={drop.id}
            className={`absolute w-4 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-b-full rounded-t-[40%] opacity-70 animate-blood-drop`}
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
              width: `${drop.size}px`,
              height: `${drop.size * 1.5}px`,
              transform: "translateZ(0)",
            }}
          />
        ))}
      </div>

      {/* Main Content with Dynamic Padding */}
      <div
        className={`relative z-10 container mx-auto px-4 py-16 transition-all duration-300 ${
          isSidebarExpanded ? 'md:pl-64' : 'md:pl-16'
        } pt-16`}
      >
        <div className={`max-w-4xl mx-auto rounded-2xl p-8 shadow-2xl ${
          theme === 'dark' ? 'bg-white/10 backdrop-blur-lg' : 'bg-white'
        }`}>
          <div className="text-center mb-12">
            <Droplet className="w-16 h-16 text-red-600 mx-auto mb-4 animate-heartbeat" />
            <h1 className={`text-4xl font-bold mb-4 transition-colors animate-heartbeat-text ${
              theme === 'dark' ? 'text-white hover:text-red-500' : 'text-black hover:text-red-400'
            }`}>
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className={`text-lg transition-colors ${
              theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}>
              Sự đóng góp của bạn có thể cứu sống nhiều người. Hãy liên hệ với chúng tôi ngay hôm nay.
            </p>
          </div>

          {success && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              theme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-700'
            }`}>
              <CheckCircle className="w-5 h-5" />
              <span>Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ lại sớm.</span>
            </div>
          )}

          {error && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              theme === 'dark' ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-700'
            }`}>
              <span>{error}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <h2 className={`text-2xl font-semibold mb-6 transition-colors animate-heartbeat-text ${
                theme === 'dark' ? 'text-white hover:text-red-500' : 'text-black hover:text-red-400'
              }`}>
                Liên Hệ
              </h2>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 group">
                  <Phone className={`w-6 h-6 transition-colors ${
                    theme === 'dark' ? 'text-red-500 group-hover:text-red-400' : 'text-red-400 group-hover:text-red-500'
                  }`} />
                  <p className={`transition-colors ${
                    theme === 'dark' ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-black'
                  }`}>
                    +84 123 456 789
                  </p>
                </div>

                <div className="flex items-center space-x-4 group">
                  <Mail className={`w-6 h-6 transition-colors ${
                    theme === 'dark' ? 'text-red-500 group-hover:text-red-400' : 'text-red-400 group-hover:text-red-500'
                  }`} />
                  <p className={`transition-colors ${
                    theme === 'dark' ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-black'
                  }`}>
                    lienhe@hienmau.org
                  </p>
                </div>

                <div className="flex items-center space-x-4 group">
                  <MapPin className={`w-6 h-6 transition-colors ${
                    theme === 'dark' ? 'text-red-500 group-hover:text-red-400' : 'text-red-400 group-hover:text-red-500'
                  }`} />
                  <p className={`transition-colors ${
                    theme === 'dark' ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-black'
                  }`}>
                    123 Đường Sự Sống, Thành phố Y Tế, 12345
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <h3 className={`text-xl font-semibold mb-4 transition-colors animate-heartbeat-text ${
                  theme === 'dark' ? 'text-white hover:text-red-500' : 'text-black hover:text-red-400'
                }`}>
                  Theo Dõi Chúng Tôi
                </h3>
                <div className="flex space-x-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <Facebook className={`w-6 h-6 transition-colors ${
                      theme === 'dark' ? 'text-gray-300 hover:text-red-500' : 'text-gray-700 hover:text-red-400'
                    }`} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className={`w-6 h-6 transition-colors ${
                      theme === 'dark' ? 'text-gray-300 hover:text-red-500' : 'text-gray-700 hover:text-red-400'
                    }`} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <Instagram className={`w-6 h-6 transition-colors ${
                      theme === 'dark' ? 'text-gray-300 hover:text-red-500' : 'text-gray-700 hover:text-red-400'
                    }`} />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tên Của Bạn"
                  className={`w-full px-4 py-3 rounded-lg focus:border-red-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border-gray-700 text-white placeholder-gray-400 hover:border-red-400'
                      : 'bg-gray-100 border-gray-300 text-black placeholder-gray-500 hover:border-red-500'
                  }`}
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Của Bạn"
                  className={`w-full px-4 py-3 rounded-lg focus:border-red-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border-gray-700 text-white placeholder-gray-400 hover:border-red-400'
                      : 'bg-gray-100 border-gray-300 text-black placeholder-gray-500 hover:border-red-500'
                  }`}
                />
              </div>
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tin Nhắn Của Bạn"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg focus:border-red-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border-gray-700 text-white placeholder-gray-400 hover:border-red-400'
                      : 'bg-gray-100 border-gray-300 text-black placeholder-gray-500 hover:border-red-500'
                  }`}
                ></textarea>
              </div>
              <div className="relative">
                <button
                  type="submit"
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                    theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 hover:bg-red-500'
                  }`}
                >
                  Gửi Tin Nhắn
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUsPage;