import React from 'react';
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

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 pb-32">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/roadmaps" element={<Roadmaps />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/interview" element={<MockInterview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <MinimizableProgressBar />
      </div>
    </div>
  );
};