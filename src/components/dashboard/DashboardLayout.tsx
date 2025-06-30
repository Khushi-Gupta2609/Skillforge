// DashboardLayout.tsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MinimizableProgressBar } from './MinimizableProgressBar';
import { Overview } from '../../pages/Overview';
import { Roadmaps } from '../../pages/Roadmaps';
import { Goals } from '../../pages/Goals';
import { MockInterview } from '../../pages/MockInterview';
import { Analytics } from '../../pages/Analytics';
import { Profile } from '../../pages/Profile';
import { Menu, X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - Mobile overlay, desktop static */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:shadow-lg lg:max-w-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area (this div wraps Header and main page content) */}
      {/* KEY REFACTOR: lg:ml-64 shifts this entire block when sidebar is static */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Header component */}
        {/* Its internal padding (px-3/4/6) will define content alignment */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} isSidebarOpen={isSidebarOpen} />
        
        {/* Main content area for pages */}
        {/* We use p-4 (padding all sides 1rem) for general content padding, adjusting for md */}
        {/* The overall left shift is now handled by the parent div's lg:ml-64 */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 pb-24 sm:pb-32">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/roadmaps" element={<Roadmaps />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/interview" element={<MockInterview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        
        {/* Minimizable Progress Bar */}
        <MinimizableProgressBar />
      </div>
    </div>
  );
};