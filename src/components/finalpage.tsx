import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { claimReward } from '../utils/contract';
import { Heart, Gift, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/animation.css';
import { create } from 'ipfs-http-client';

// Cấu hình IPFS client với Pinata
const projectId = '686ca06bec3d55f2dbc3'; // Thay bằng API Key của bạn
const projectSecret = '8924f0cb4ac1cb995947dd8c90331f0430a0cdf6b08a6b00144279b53b690769'; // Thay bằng API Secret của bạn
const auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4OWVkNDcyZi0wZGZjLTRiY2MtYjZjNi1hNWEzNTZhNjhiYTQiLCJlbWFpbCI6InRvbmdjaGluaGNodW5nLmd2MjAwM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNjg2Y2EwNmJlYzNkNTVmMmRiYzMiLCJzY29wZWRLZXlTZWNyZXQiOiI4OTI0ZjBjYjRhYzFjYjk5NTk0N2RkOGM5MDMzMWYwNDMwYTBjZGY2YjA4YTZiMDAxNDQyNzliNTNiNjkwNzY5IiwiZXhwIjoxNzc3NzgyNzE1fQ.vK2DnPaIo3okY843Ly1aLo59uote0zL4EveEJGW7Ec8'; // Thay bằng JWT của bạn
const ipfs = create({
  url: 'https://api.pinata.cloud/ps/api/v0',
  headers: {
    Authorization: auth,
  },
});

interface FinalPageProps {
  isSidebarExpanded: boolean;
  theme: 'light' | 'dark';
}

function FinalPage({ isSidebarExpanded, theme }: FinalPageProps) {
  const [status, setStatus] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'loading' | ''>('');
  const [bloodDrops, setBloodDrops] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);
  const [showRipple, setShowRipple] = useState<{ x: number; y: number } | null>(null);
  const [donorData, setDonorData] = useState<any>(null);
  const [loadingDonorData, setLoadingDonorData] = useState(true);
  const [errorDonorData, setErrorDonorData] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { donorDataCid } = location.state || {};

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

  // Truy xuất thông tin người hiến máu từ IPFS
  useEffect(() => {
    const fetchDonorData = async () => {
      if (!donorDataCid) {
        setErrorDonorData('Không tìm thấy thông tin đặt lịch.');
        setLoadingDonorData(false);
        return;
      }

      try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${donorDataCid}`);
        const data = await response.json();
        setDonorData(data);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu từ IPFS:', err);
        setErrorDonorData('Không thể lấy thông tin từ IPFS. Vui lòng thử lại!');
      } finally {
        setLoadingDonorData(false);
      }
    };

    fetchDonorData();
  }, [donorDataCid]);

  // Kiểm tra kết nối ví và nhận thưởng
  useEffect(() => {
    const savedAccount = localStorage.getItem('connectedWallet');
    if (!savedAccount) {
      setStatus('Vui lòng kết nối ví để nhận phần thưởng.');
      setStatusType('error');
      return;
    }

    async function handleClaimReward() {
      try {
        setStatus('Đang nhận phần thưởng của bạn...');
        setStatusType('loading');
        await claimReward();
        setStatus('Nhận phần thưởng thành công! 🎉');
        setStatusType('success');
      } catch (err) {
        console.error(err);
        setStatus('Nhận phần thưởng thất bại. Vui lòng thử lại sau.');
        setStatusType('error');
      }
    }

    handleClaimReward();
  }, []);

  const handleNavigate = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height / 2;
    setShowRipple({ x, y });
    setTimeout(() => navigate('/schedule'), 300);
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
            className="absolute w-4 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-b-full rounded-t-[40%] opacity-70 animate-blood-drop"
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
        <div className={`max-w-4xl mx-auto rounded-2xl p-8 shadow-2xl transition-colors duration-300 ${
          theme === 'dark' ? 'bg-white/10 backdrop-blur-lg' : 'bg-white/90'
        }`}>
          <div className="text-center mb-12">
            <Heart className="w-20 h-20 text-red-600 mx-auto mb-6 animate-heartbeat" />
            <h1 className={`text-4xl font-bold mb-6 hover:text-red-500 transition-colors animate-heartbeat-text ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              Cảm Ơn Bạn Vì Hành Động Cao Đẹp
            </h1>
            <p className={`text-xl mb-8 hover:text-opacity-90 transition-colors ${
              theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
            }`}>
              Quyết định hiến máu của bạn sẽ giúp cứu sống những cuộc đời quý giá.
            </p>
          </div>

          {/* Hiển thị thông tin người hiến máu */}
          {loadingDonorData ? (
            <div className="text-center mb-12">
              <p className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Đang tải thông tin đặt lịch...
              </p>
            </div>
          ) : errorDonorData ? (
            <div className="text-center mb-12">
              <p className="text-red-500 text-lg">{errorDonorData}</p>
            </div>
          ) : donorData ? (
            <div className={`mb-12 p-6 rounded-xl border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-white/5 border-red-500/20 hover:border-red-500/50' : 'bg-gray-200/50 border-red-400/20 hover:border-red-400/50'
            }`}>
              <h2 className={`text-2xl font-semibold mb-4 text-center ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Thông Tin Đặt Lịch Hiến Máu
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Họ và Tên:</strong> {donorData.name}
                </p>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Ngày Hiến Máu:</strong> {donorData.date}
                </p>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Thời Gian:</strong> {donorData.time}
                </p>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Địa Điểm:</strong> {donorData.location}
                </p>
              </div>
              {donorData.imageCid && donorData.imageCid !== 'No image uploaded' && (
                <div className="mt-4">
                  <p className={`mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Hình Ảnh:</strong>
                  </p>
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${donorData.imageCid}`}
                    alt="Donor"
                    className="w-full max-w-xs mx-auto rounded-lg"
                  />
                </div>
              )}
              <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Dữ liệu đã được lưu trên IPFS với CID: {donorDataCid}
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className={`p-6 rounded-xl border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-white/5 border-red-500/20 hover:border-red-500/50' : 'bg-gray-200/50 border-red-400/20 hover:border-red-400/50'
            }`}>
              <Gift className="w-12 h-12 text-red-500 mb-4 mx-auto" />
              <h3 className={`text-xl font-semibold mb-2 text-center animate-heartbeat-text ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Một Lần Hiến Máu
              </h3>
              <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Có thể cứu được tới ba cuộc đời
              </p>
            </div>
            <div className={`p-6 rounded-xl border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-white/5 border-red-500/20 hover:border-red-500/50' : 'bg-gray-200/50 border-red-400/20 hover:border-red-400/50'
            }`}>
              <Users className="w-12 h-12 text-red-500 mb-4 mx-auto" />
              <h3 className={`text-xl font-semibold mb-2 text-center animate-heartbeat-text ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Mỗi 2 Giây
              </h3>
              <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Có người cần máu
              </p>
            </div>
            <div className={`p-6 rounded-xl border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-white/5 border-red-500/20 hover:border-red-500/50' : 'bg-gray-200/50 border-red-400/20 hover:border-red-400/50'
            }`}>
              <Calendar className="w-12 h-12 text-red-500 mb-4 mx-auto" />
              <h3 className={`text-xl font-semibold mb-2 text-center animate-heartbeat-text ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Hiến Máu Định Kỳ
              </h3>
              <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Giúp duy trì nguồn cung cấp máu
              </p>
            </div>
          </div>

          <div className="text-center mb-12">
            <p className={`text-2xl italic mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              "Món quà của máu là món quà của sự sống"
            </p>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Cam kết giúp đỡ người khác thông qua việc hiến máu của bạn thật đáng ngưỡng mộ. Cùng nhau, chúng ta có thể tạo ra sự thay đổi trong cộng đồng.
            </p>
          </div>

          {status && (
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center gap-2 p-4 rounded-lg ${
                  statusType === 'success'
                    ? 'bg-green-100 text-green-700'
                    : statusType === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {statusType === 'success' && <CheckCircle className="w-5 h-5" />}
                {statusType === 'error' && <AlertCircle className="w-5 h-5" />}
                {statusType === 'loading' && (
                  <div className="w-5 h-5 border-2 border-t-transparent border-yellow-700 rounded-full animate-spin"></div>
                )}
                <p className="text-lg font-semibold">{status}</p>
              </div>
            </div>
          )}

          <div className="text-center relative">
            <button
              onClick={handleNavigate}
              className={`py-4 px-8 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2 ${
                theme === 'dark'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-400 text-white hover:bg-red-500'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>Lên Lịch Hiến Máu Lần Nữa</span>
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
            <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Bạn có thể hiến máu lại sau 56 ngày
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalPage;