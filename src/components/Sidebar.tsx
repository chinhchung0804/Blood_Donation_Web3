import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home, Calendar, Users, Menu, X, ChevronLeft, ChevronRight, History } from 'lucide-react';

interface SidebarProps {
  onToggle: (isExpanded: boolean) => void;
  theme: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle(newExpanded);
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-16 left-4 z-50 md:hidden p-2 rounded-full focus:outline-none transition-colors duration-300 ${
          theme === 'dark' ? 'text-white bg-gray-700' : 'text-black bg-gray-300'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out ${
          isOpen || isExpanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isExpanded ? 'w-64' : 'w-16'} pt-16 overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800/90 text-white' : 'bg-gray-200/90 text-black'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle Button */}
          <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-400'
          }`}>
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-red-600 animate-heartbeat" />
              {isExpanded && (
                <Link
                  to="/"
                  className={`text-xl font-bold hover:text-red-500 transition-colors -translate-x-4 ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}
                >
                  Hiến Máu Cứu Người
                </Link>
              )}
            </div>
            <button
              onClick={toggleExpand}
              className={`p-2 rounded-full transition-all duration-300 -ml-8 top-4 ${
                isExpanded ? 'left-64' : 'left-16'
              } z-50 ${
                theme === 'dark' ? 'text-white bg-gray-700' : 'text-black bg-gray-300'
              }`}
            >
              {isExpanded ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
          </div>

          {/* MENU title */}
          {isExpanded && (
            <div className={`p-4 border-b transition-colors duration-300 ${
              theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-400 text-gray-600'
            } font-semibold text-sm`}>
              MENU
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col space-y-4 p-4">
            <Link
              to="/"
              className={`flex items-center space-x-3 hover:text-red-500 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <Home className="w-6 h-6" />
              {isExpanded && <span>Trang Chủ</span>}
            </Link>
            <Link
              to="/campaign"
              className={`flex items-center space-x-3 hover:text-red-500 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <Users className="w-6 h-6" />
              {isExpanded && <span>Chiến Dịch</span>}
            </Link>
            <Link
              to="/schedule"
              className={`flex items-center space-x-3 hover:text-red-500 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <Calendar className="w-6 h-6" />
              {isExpanded && <span>Lên Lịch</span>}
            </Link>
            <Link
              to="/history"
              className={`flex items-center space-x-3 hover:text-red-500 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <History className="w-6 h-6" />
              {isExpanded && <span>Lịch Sử Hoạt Động</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && !isExpanded && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;