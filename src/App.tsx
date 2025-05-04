import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainPage from './components/MainPage';
import DonatePage from './components/DonatePage';
import ContactUsPage from './components/ContactUsPage';
import ScheduleAppointment from './components/ScheduleAppointment';
import FinalPage from './components/finalpage';
import Campaign from './components/Campaign';
import HistoryPage from './components/History';

const App: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const handleSidebarToggle = (isExpanded: boolean) => {
    setIsSidebarExpanded(isExpanded);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Nếu không có giá trị trong localStorage, đặt mặc định là dark
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  return (
    <Router>
      <div className="relative min-h-screen">
        {/* Navbar */}
        <Navbar onThemeChange={handleThemeChange} theme={theme} />

        {/* Sidebar */}
        <Sidebar onToggle={handleSidebarToggle} theme={theme} />

        {/* Main Content */}
        <div className="w-full h-full">
          <Routes>
            <Route path="/" element={<MainPage isSidebarExpanded={isSidebarExpanded} theme={theme} />} />
            <Route path="/donate" element={<DonatePage isSidebarExpanded={isSidebarExpanded} theme={theme} />} />
            <Route path="/contact" element={<ContactUsPage isSidebarExpanded={isSidebarExpanded} theme={theme} />} />
            <Route path="/schedule" element={<ScheduleAppointment theme={theme} />} />
            <Route path="/final" element={<FinalPage isSidebarExpanded={isSidebarExpanded} theme={theme} />} />
            <Route path="/campaign" element={<Campaign isSidebarExpanded={isSidebarExpanded} theme={theme} />} />
            <Route path="/history" element={<HistoryPage theme={theme} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;