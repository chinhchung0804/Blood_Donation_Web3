import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Heart, Activity } from 'lucide-react';
import { donateEther, claimReward } from '../utils/contract.jsx';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/animation.css';
import { ethers } from 'ethers';
import contractAddresses from '../contract-address.json';

interface Campaign {
  id: number;
  date: string;
  time: string;
  venue: string;
  votes: number;
}

interface HistoryItem {
  type: 'donation' | 'campaign';
  amount?: string;
  campaignId?: number;
  date: string;
  time: string;
  venue?: string;
  timestamp: string;
  walletAddress?: string;
}

interface CampaignProps {
  isSidebarExpanded: boolean;
  theme: 'light' | 'dark';
}

const Campaign = ({ isSidebarExpanded, theme }: CampaignProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: 1, date: '25/03/2024', time: '9:00 - 17:00', venue: 'Trung tâm Cộng đồng Thành phố', votes: 0 },
    { id: 2, date: '02/04/2024', time: '10:00 - 18:00', venue: 'Bệnh viện Trung ương', votes: 0 },
    { id: 3, date: '15/04/2024', time: '8:00 - 16:00', venue: 'Khuôn viên Đại học', votes: 0 },
  ]);

  const [votedFor, setVotedFor] = useState<number | null>(null);
  const [newCampaign, setNewCampaign] = useState({ date: '', time: '', venue: '' });
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [bloodDrops, setBloodDrops] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  const [showHeartbeat, setShowHeartbeat] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [mtkBalance, setMtkBalance] = useState<string>('0');

  const WALLET_ADDRESS = contractAddresses.Wallet;
  const MTK_TOKEN_ADDRESS = contractAddresses.MTKToken;

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);
          window.ethereum.on('accountsChanged', (accounts: string[]) => setWalletAddress(accounts[0] || null));
          await updateMtkBalance(address, provider);
        } catch (err) {
          setStatus('Không thể kết nối ví MetaMask. Vui lòng thử lại!');
          console.error('Error connecting to MetaMask:', err);
        }
      } else {
        setStatus('Vui lòng cài đặt MetaMask để tiếp tục!');
      }
    };

    const generateBloodDrops = () => {
      const newDrops = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 5,
      }));
      setBloodDrops(newDrops);
    };

    connectWallet();
    generateBloodDrops();
    window.addEventListener('load', generateBloodDrops);
    return () => window.removeEventListener('load', generateBloodDrops);
  }, []);

  const updateMtkBalance = async (address: string, provider: ethers.BrowserProvider): Promise<string> => {
    try {
      const mtkContract = new ethers.Contract(MTK_TOKEN_ADDRESS, ['function balanceOf(address) view returns (uint256)'], provider);
      const balance = await mtkContract.balanceOf(address);
      const formattedBalance = ethers.formatEther(balance);
      setMtkBalance(formattedBalance);
      return formattedBalance;
    } catch (err) {
      console.error('Error fetching MTK balance:', err);
      return '0';
    }
  };

  const addTokenToMetaMask = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: { address: MTK_TOKEN_ADDRESS, symbol: 'MTK', decimals: 18, image: 'https://via.placeholder.com/32' },
        },
      });
      setStatus('Đã thêm token MTK vào MetaMask!');
    } catch (err) {
      setStatus('Không thể thêm token vào MetaMask: ' + (err as Error).message);
    }
  };

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'reason' in err) return (err as { reason: string }).reason;
    if (typeof err === 'object' && err !== null && 'error' in err && typeof (err as { error: unknown }).error === 'object' && (err as { error: { message?: unknown } }).error !== null && 'message' in (err as { error: { message: unknown } }).error) {
      const message = (err as { error: { message: unknown } }).error.message;
      return typeof message === 'string' ? message : 'Đã xảy ra lỗi không xác định.';
    }
    if (err instanceof Error && err.message) return err.message;
    return 'Đã xảy ra lỗi không xác định.';
  };

  const handleVote = (campaignId: number) => {
    setStatus(`Đang xử lý bình chọn cho Chiến dịch #${campaignId}...`);
    const updatedCampaigns = campaigns.map((campaign) => (campaign.id === campaignId ? { ...campaign, votes: campaign.votes + 1 } : campaign));
    setCampaigns(updatedCampaigns);
    setVotedFor(campaignId);
    localStorage.setItem('votedCampaign', campaignId.toString());
    localStorage.setItem('campaignVotes', JSON.stringify(updatedCampaigns));
    setStatus(`Đã bình chọn thành công cho Chiến dịch #${campaignId}!`);
    setShowHeartbeat(true);
  };

  const handleDonate = async () => {
    try {
      if (!walletAddress) {
        setStatus('Vui lòng kết nối ví MetaMask trước khi quyên góp!');
        return;
      }
      if (!amount || parseFloat(amount) < 0.01) {
        setStatus('Số tiền quyên góp phải ít nhất 0.01 ETH để nhận thưởng.');
        return;
      }
      setStatus(`Đang xử lý quyên góp ${amount} ETH...`);
      const tx = await donateEther(amount);
      await tx.wait();
      setStatus(`Đã quyên góp thành công ${amount} ETH!`);
      const history: HistoryItem[] = JSON.parse(localStorage.getItem('userHistory') || '[]');
      history.push({ type: 'donation', amount, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), timestamp: new Date().toISOString(), walletAddress });
      localStorage.setItem('userHistory', JSON.stringify(history));
      setAmount('');
      setShowHeartbeat(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await updateMtkBalance(walletAddress, provider);
    } catch (err) {
      console.error('Lỗi quyên góp:', err);
      setStatus(`Lỗi: ${getErrorMessage(err)}`);
    }
  };

  const handleClaimReward = async () => {
    try {
      if (!walletAddress) {
        setStatus('Vui lòng kết nối ví MetaMask trước khi nhận thưởng!');
        return;
      }
      setStatus('Đang xử lý nhận phần thưởng...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tx = await claimReward();
      console.log('Transaction Hash:', tx.hash);
      const receipt = await tx.wait();
      if (receipt.status !== 1) throw new Error('Giao dịch thất bại');
      const newBalance = await updateMtkBalance(walletAddress, provider);
      await addTokenToMetaMask();
      setStatus(`Nhận phần thưởng thành công! 🎉 Bạn đã nhận được 1 MTK. Số dư: ${newBalance} MTK`);
      setShowHeartbeat(true);
    } catch (err) {
      console.error('Lỗi nhận thưởng:', err);
      setStatus(`Lỗi: ${getErrorMessage(err)}`);
    }
  };

  const handleCreateCampaign = () => {
    if (!walletAddress) {
      setStatus('Vui lòng kết nối ví MetaMask trước khi tạo chiến dịch!');
      return;
    }
    const { date, time, venue } = newCampaign;
    if (!date || !time || !venue) {
      setStatus('Vui lòng điền đầy đủ thông tin để tạo chiến dịch.');
      return;
    }
    const newId = campaigns.length + 1;
    const updatedCampaigns = [...campaigns, { id: newId, date, time, venue, votes: 0 }];
    setCampaigns(updatedCampaigns);
    localStorage.setItem('campaignVotes', JSON.stringify(updatedCampaigns));
    const history: HistoryItem[] = JSON.parse(localStorage.getItem('userHistory') || '[]');
    history.push({ type: 'campaign', campaignId: newId, date, time, venue, timestamp: new Date().toISOString(), walletAddress });
    localStorage.setItem('userHistory', JSON.stringify(history));
    setNewCampaign({ date: '', time: '', venue: '' });
    setStatus('Đã tạo chiến dịch thành công!');
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
      <div className="absolute inset-0 pointer-events-none">
        {bloodDrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute w-4 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-b-full rounded-t-[40%] opacity-70 animate-blood-drop"
            style={{ left: `${drop.left}%`, animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s`, transform: 'translateZ(0)' }}
          />
        ))}
      </div>
      {showHeartbeat && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <Heart className="w-20 h-20 text-red-600 animate-heartbeat" />
        </div>
      )}
      <div className={`container mx-auto px-4 py-12 pt-24 ${isSidebarExpanded ? 'md:pl-64' : 'md:pl-16'}`}>
        <h1 className={`text-5xl font-bold text-center mb-8 ${theme === 'dark' ? 'text-red-600' : 'text-red-500'}`}>Hiến Máu, Cứu Người</h1>
        {walletAddress ? (
          <p className={`text-center mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Đã kết nối ví: {walletAddress} | Số dư MTK: {mtkBalance} MTK</p>
        ) : (
          <p className="text-center mb-4 text-red-500">Vui lòng kết nối ví MetaMask để tiếp tục!</p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`rounded-2xl p-6 shadow-2xl border transform transition-all duration-300 hover:scale-105 ${theme === 'dark' ? 'bg-gray-900 border-red-600' : 'bg-white border-red-400'}`}
            >
              <div className="space-y-4">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-600' : 'text-red-500'}`}>Chiến dịch #{campaign.id}</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-red-500' : 'text-red-400'}`} />
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Ngày</h3>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{campaign.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-red-500' : 'text-red-400'}`} />
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Thời gian</h3>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{campaign.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className={`w-5 h-5 ${theme === 'dark' ? 'text-red-500' : 'text-red-400'}`} />
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Địa điểm</h3>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{campaign.venue}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <Activity className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-red-500' : 'text-red-400'}`} />
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-600' : 'text-red-500'}`}>{campaign.votes} lượt bình chọn</p>
                  </div>
                  <button
                    onClick={() => handleVote(campaign.id)}
                    disabled={votedFor !== null}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-full text-lg font-semibold transition-all ${
                      votedFor !== null
                        ? votedFor === campaign.id
                          ? 'bg-red-600 cursor-not-allowed'
                          : 'bg-gray-700 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-400 hover:bg-red-500'
                    } ${theme === 'dark' ? 'text-white' : 'text-white'}`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>
                      {votedFor !== null
                        ? votedFor === campaign.id
                          ? 'Đã bình chọn!'
                          : 'Đã bình chọn chiến dịch khác'
                        : 'Chúng tôi ủng hộ'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={`max-w-lg mx-auto rounded-lg p-6 shadow-2xl border mt-8 ${theme === 'dark' ? 'bg-gray-900 border-red-600' : 'bg-white border-red-400'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-red-600' : 'text-red-500'}`}>Quyên góp Ether</h2>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Sự quyên góp của bạn giúp chúng tôi tổ chức các chiến dịch tốt hơn, tiếp cận nhiều người hiến máu hơn và cung cấp các tiện ích tốt hơn tại các địa điểm. Mỗi đóng góp đều góp phần cứu sống mạng người!
          </p>
          <form>
            <input
              type="number"
              step="0.01"
              placeholder="Số lượng Ether muốn quyên góp (tối thiểu 0.01 ETH để nhận thưởng)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full p-2 mb-4 border rounded ${theme === 'dark' ? 'bg-black border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
            />
            <button type="button" onClick={handleDonate} className={`w-full py-2 rounded text-white ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 hover:bg-red-500'}`}>
              Quyên góp Ether
            </button>
          </form>
        </div>
        <div className={`max-w-lg mx-auto rounded-lg p-6 shadow-2xl border mt-8 ${theme === 'dark' ? 'bg-gray-900 border-red-600' : 'bg-white border-red-400'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-red-600' : 'text-red-500'}`}>Nhận Phần Thưởng</h2>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Quyên góp ít nhất 0.01 ETH để nhận 1 MTK token như một lời cảm ơn cho sự đóng góp của bạn! Mỗi địa chỉ chỉ được nhận thưởng một lần.
          </p>
          <button type="button" onClick={handleClaimReward} className={`w-full py-2 rounded text-white ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 hover:bg-red-500'}`}>
            Nhận phần thưởng
          </button>
        </div>
        {status && (status.startsWith('Đã quyên góp thành công') || status.startsWith('Nhận phần thưởng thành công')) && (
          <div className={`max-w-lg mx-auto text-center p-4 rounded-lg mt-8 ${theme === 'dark' ? 'bg-green-800' : 'bg-green-200'}`}>
            <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-green-800'}`}>{status}</p>
          </div>
        )}
        <div className={`max-w-lg mx-auto rounded-lg p-6 shadow-2xl border mt-4 ${theme === 'dark' ? 'bg-gray-900 border-red-600' : 'bg-white border-red-400'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-red-600' : 'text-red-500'}`}>Tạo Chiến dịch Mới</h2>
          <form>
            <input
              type="date"
              value={newCampaign.date}
              onChange={(e) => setNewCampaign({ ...newCampaign, date: e.target.value })}
              className={`w-full p-2 mb-4 border rounded ${theme === 'dark' ? 'bg-black border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
            />
            <input
              type="text"
              placeholder="Thời gian (ví dụ: 9:00 - 17:00)"
              value={newCampaign.time}
              onChange={(e) => setNewCampaign({ ...newCampaign, time: e.target.value })}
              className={`w-full p-2 mb-4 border rounded ${theme === 'dark' ? 'bg-black border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
            />
            <input
              type="text"
              placeholder="Địa điểm"
              value={newCampaign.venue}
              onChange={(e) => setNewCampaign({ ...newCampaign, venue: e.target.value })}
              className={`w-full p-2 mb-4 border rounded ${theme === 'dark' ? 'bg-black border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
            />
            <button type="button" onClick={handleCreateCampaign} className={`w-full py-2 rounded text-white ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 hover:bg-red-500'}`}>
              Tạo Chiến dịch
            </button>
          </form>
        </div>
        {status && !status.startsWith('Đã quyên góp thành công') && !status.startsWith('Nhận phần thưởng thành công') && (
          <div className="mt-8 text-center">
            <p className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaign;