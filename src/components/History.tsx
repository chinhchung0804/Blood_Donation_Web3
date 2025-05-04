import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PINATA_JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4OWVkNDcyZi0wZGZjLTRiY2MtYjZjNi1hNWEzNTZhNjhiYTQiLCJlbWFpbCI6InRvbmdjaGluaGNodW5nLmd2MjAwM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNjg2Y2EwNmJlYzNkNTVmMmRiYzMiLCJzY29wZWRLZXlTZWNyZXQiOiI4OTI0ZjBjYjRhYzFjYjk5NTk0N2RkOGM5MDMzMWYwNDMwYTBjZGY2YjA4YTZiMDAxNDQyNzliNTNiNjkwNzY5IiwiZXhwIjoxNzc3NzgyNzE1fQ.vK2DnPaIo3okY843Ly1aLo59uote0zL4EveEJGW7Ec8';

interface ScheduleHistoryItem {
  name: string;
  address: string;
  date: string;
  time: string;
  location: string;
  imageCid?: string;
  timestamp: string;
}

interface DonationHistoryItem {
  type: 'donation' | 'campaign';
  amount?: string;
  campaignId?: number;
  date: string;
  time: string;
  venue?: string;
  timestamp: string;
  walletAddress?: string;
}

interface HistoryPageProps {
  theme: 'light' | 'dark';
}

const HistoryPage = ({ theme }: HistoryPageProps) => {
  const navigate = useNavigate();
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleHistoryItem[]>([]);
  const [donationHistory, setDonationHistory] = useState<DonationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Lấy lịch sử đặt lịch từ scheduledDonors
        const scheduledDonors = JSON.parse(localStorage.getItem('scheduledDonors') || '[]');
        const scheduleHistoryData = await Promise.all(
          scheduledDonors.map(async (donor: { cid: string; name: string; walletAddress: string }) => {
            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${donor.cid}`);
            const data = response.data;
            return {
              ...data,
              address: donor.walletAddress,
            };
          })
        );
        setScheduleHistory(scheduleHistoryData);

        // Lấy lịch sử quyên góp từ userHistory
        const userHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
        setDonationHistory(userHistory);
      } catch (err) {
        setError('Không thể tải lịch sử. Vui lòng thử lại!');
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleScheduleAgain = () => {
    navigate('/schedule');
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
    }`}>
      <div className={`container mx-auto pl-20 pr-4 py-16 transition-all duration-300 pt-16`}>
        <h1 className={`text-4xl font-bold text-center mb-8 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>
          Lịch Sử Hoạt Động
        </h1>

        {/* Phần 1: Lịch sử đặt lịch */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            Lịch Sử Đặt Lịch
          </h2>
          {loading ? (
            <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Đang tải...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : scheduleHistory.length === 0 ? (
            <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Chưa có lịch sử đặt lịch nào.
            </p>
          ) : (
            <div className="space-y-6">
              {scheduleHistory.map((item, index) => (
                <div key={index} className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                } border`}>
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Đặt Lịch #{index + 1}
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>Tên:</strong> {item.name}
                  </p>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>Địa chỉ ví:</strong> {item.address || 'Chưa cung cấp'}
                  </p>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>Ngày:</strong> {item.date}
                  </p>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>Thời gian:</strong> {item.time}
                  </p>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>Địa điểm:</strong> {item.location}
                  </p>
                  {item.imageCid && item.imageCid !== 'No image uploaded' && (
                    <div className="mt-4">
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${item.imageCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-blue-500 hover:underline ${
                          theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'
                        }`}
                      >
                        Xem hình ảnh
                      </a>
                    </div>
                  )}
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    CID: {JSON.parse(localStorage.getItem('scheduledDonors') || '[]')[index]?.cid}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phần 2: Lịch sử quyên góp ETH */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            Lịch Sử Quyên Góp ETH
          </h2>
          {loading ? (
            <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Đang tải...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : donationHistory.length === 0 ? (
            <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Chưa có lịch sử quyên góp ETH nào. Vui lòng đặt lịch và kết nối ví MetaMask để quyên góp.
            </p>
          ) : (
            <div className="space-y-6">
              {donationHistory.map((item, index) => (
                <div key={index} className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                } border`}>
                  {item.type === 'donation' ? (
                    <>
                      <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Quyên Góp #{index + 1}
                      </h3>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Số lượng:</strong> {item.amount || 'Không xác định'} ETH
                      </p>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Địa chỉ ví:</strong> {item.walletAddress || 'Chưa kết nối ví MetaMask'}
                      </p>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Ngày:</strong> {item.date}
                      </p>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Thời gian:</strong> {item.time}
                      </p>
                      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                        <strong>Thời gian giao dịch:</strong> {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Tạo Chiến Dịch #{item.campaignId}
                      </h3>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Ngày:</strong> {item.date}
                      </p>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Thời gian:</strong> {item.time}
                      </p>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Địa điểm:</strong> {item.venue}
                      </p>
                      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                        <strong>Thời gian tạo:</strong> {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút đặt lịch mới */}
        <div className="text-center mt-8">
          <button
            onClick={handleScheduleAgain}
            className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
              theme === 'dark'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-400 text-white hover:bg-red-500'
            }`}
          >
            Đặt Lịch Quyên Góp Mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;