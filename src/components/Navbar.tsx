import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home, Calendar, Users, Wallet, LogOut, Sun, Moon, Clock } from 'lucide-react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface NavbarProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
  theme: 'light' | 'dark';
}

const Navbar: React.FC<NavbarProps> = ({ onThemeChange, theme }) => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Vui lòng cài đặt MetaMask để kết nối ví!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        localStorage.setItem('connectedWallet', address);

        // Gắn sự kiện accountsChanged
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
            localStorage.setItem('connectedWallet', newAccounts[0]);
          } else {
            setAccount(null);
            localStorage.removeItem('connectedWallet');
          }
        });
      } else {
        alert('Vui lòng chọn một tài khoản trong MetaMask!');
      }
    } catch (error) {
      console.error('Lỗi kết nối ví:', error);
      alert('Đã có lỗi xảy ra khi kết nối ví. Vui lòng kiểm tra console để biết chi tiết!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem('connectedWallet');

    // Hủy sự kiện accountsChanged nếu có
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', () => {});
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    onThemeChange(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedAccount = localStorage.getItem('connectedWallet');
    if (savedAccount) {
      setAccount(savedAccount);
    }

    // Cleanup sự kiện khi component unmount
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 shadow-lg transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900/90 text-white' : 'bg-gray-100/90 text-black'
    } backdrop-blur-md`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Heart className="w-8 h-8 text-red-600 animate-heartbeat" />
          <Link to="/" className={`text-2xl font-bold hover:text-red-500 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Hiến Máu Cứu Người
          </Link>
        </div>

        {/* Navigation Links and Wallet/Theme Toggle */}
        <div className="flex items-center space-x-4">
          {/* Navigation Links (Hidden on Mobile) */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              <Home className="w-5 h-5" />
              <span>Trang Chủ</span>
            </Link>
            <Link to="/campaign" className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              <Users className="w-5 h-5" />
              <span>Chiến Dịch</span>
            </Link>
            <Link to="/schedule" className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              <Calendar className="w-5 h-5" />
              <span>Lên Lịch</span>
            </Link>
            <Link to="/history" className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              <Clock className="w-5 h-5" />
              <span>Lịch Sử</span>
            </Link>
          </div>

          {/* Wallet Connection */}
          {account ? (
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-red-500" />
              <span className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>{shortenAddress(account)}</span>
              <button
                onClick={disconnectWallet}
                className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Ngắt</span>
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span>Kết nối ví</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors hover:bg-opacity-20 ${
              theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-300'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;