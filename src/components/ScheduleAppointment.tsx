import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { ethers } from 'ethers';

const PINATA_API_KEY = '686ca06bec3d55f2dbc3';
const PINATA_JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4OWVkNDcyZi0wZGZjLTRiY2MtYjZjNi1hNWEzNTZhNjhiYTQiLCJlbWFpbCI6InRvbmdjaGluaGNodW5nLmd2MjAwM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNjg2Y2EwNmJlYzNkNTVmMmRiYzMiLCJzY29wZWRLZXlTZWNyZXQiOiI4OTI0ZjBjYjRhYzFjYjk5NTk0N2RkOGM5MDMzMWYwNDMwYTBjZGY2YjA4YTZiMDAxNDQyNzliNTNiNjkwNzY5IiwiZXhwIjoxNzc3NzgyNzE1fQ.vK2DnPaIo3okY843Ly1aLo59uote0zL4EveEJGW7Ec8';

interface ScheduleAppointmentProps {
  theme: 'light' | 'dark';
}

interface PinataErrorResponse {
  error: {
    reason: string;
    details?: string;
  };
}

const ScheduleAppointment = ({ theme }: ScheduleAppointmentProps) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);
        } catch (err) {
          setError('Không thể kết nối ví MetaMask. Vui lòng thử lại!');
          console.error('Error connecting to MetaMask:', err);
        }
      } else {
        setError('Vui lòng cài đặt MetaMask để tiếp tục!');
      }
    };

    connectWallet();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!walletAddress) {
      setError('Vui lòng kết nối ví MetaMask trước khi đặt lịch!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageCid = '';
      if (image) {
        const formDataToUpload = new FormData();
        formDataToUpload.append('file', image);
        formDataToUpload.append('pinataMetadata', JSON.stringify({ name: `${userData.name}_donor_image` }));

        const imageResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formDataToUpload, {
          headers: {
            Authorization: PINATA_JWT,
            'Content-Type': 'multipart/form-data',
          },
        });

        imageCid = imageResponse.data.IpfsHash;
      }

      const donorData = {
        name: userData.name,
        date: userData.date,
        time: userData.time,
        location: userData.location,
        imageCid: imageCid || 'No image uploaded',
        timestamp: new Date().toISOString(),
      };

      const donorDataResponse = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', donorData, {
        headers: {
          Authorization: PINATA_JWT,
        },
        params: {
          pinataMetadata: JSON.stringify({ name: `${userData.name}_donor_data` }),
        },
      });

      const donorDataCid = donorDataResponse.data.IpfsHash;

      // Lưu vào scheduledDonors
      const scheduledDonors = JSON.parse(localStorage.getItem('scheduledDonors') || '[]');
      scheduledDonors.push({ cid: donorDataCid, name: userData.name, walletAddress });
      localStorage.setItem('scheduledDonors', JSON.stringify(scheduledDonors));

      // Lưu vào userHistory với thông tin quyên góp
      const userHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
      userHistory.push({
        type: 'donation',
        amount: '1', // Giả sử quyên góp 1 ETH
        walletAddress: walletAddress, // Lưu địa chỉ ví
        date: userData.date,
        time: userData.time,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('userHistory', JSON.stringify(userHistory));

      navigate('/final', { state: { donorDataCid } });
    } catch (err) {
      const error = err as AxiosError<PinataErrorResponse>;
      if (error.response) {
        setError(`Lỗi từ Pinata: ${error.response.data.error.details || error.response.data.error.reason}. Vui lòng thử lại!`);
      } else if (error.message) {
        setError(`Lỗi: ${error.message}. Vui lòng thử lại!`);
      } else {
        setError('Không thể lưu thông tin lên IPFS. Vui lòng kiểm tra console để biết chi tiết!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
    }`}>
      <div className="container mx-auto px-6 py-16">
        <h1 className={`text-4xl font-bold text-center mb-8 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>
          Đặt Lịch Hiến Máu
        </h1>
        {walletAddress ? (
          <p className={`text-center mb-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Đã kết nối ví: {walletAddress}
          </p>
        ) : (
          <p className="text-center mb-4 text-red-500">
            Vui lòng kết nối ví MetaMask để tiếp tục!
          </p>
        )}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Họ và Tên</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
              placeholder="Nhập họ và tên"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Ngày Hiến Máu</label>
            <input
              type="date"
              name="date"
              value={userData.date}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Thời Gian</label>
            <input
              type="time"
              name="time"
              value={userData.time}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Địa Điểm</label>
            <input
              type="text"
              name="location"
              value={userData.location}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
              placeholder="Nhập địa điểm hiến máu"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Hình Ảnh (Tùy Chọn)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>
          {error && <p className={`text-center ${
            theme === 'dark' ? 'text-red-400' : 'text-red-500'
          }`}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !walletAddress}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-400 hover:bg-red-500 text-white'
            } ${loading || !walletAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang Lưu...' : 'Xác Nhận Đặt Lịch'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleAppointment;