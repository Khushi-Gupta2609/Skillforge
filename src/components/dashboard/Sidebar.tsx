import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Map,
  Target,
  MessageCircle,
  User,
  TrendingUp,
  BarChart3,
  X
} from 'lucide-react';

import MyLogo from '../../../src/assets/skillfroge.png';

interface SidebarProps {
  onClose: () => void;
}

const navigationItems = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Roadmaps', href: '/dashboard/roadmaps', icon: Map },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Mock Interview', href: '/dashboard/interview', icon: MessageCircle },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img src={MyLogo} alt="SkillForge Logo" className="h-6 w-auto sm:h-8 rounded-lg" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">SkillForge</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Career Planning</p>
          </div>
        </div>
        {/* Close button for mobile */}
        <button 
          onClick={onClose} 
          className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-700 dark:text-purple-300 border-r-2 border-purple-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <item.icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer for mobile */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          SkillForge © 2024
        </p>
      </div>
    </div>
  );
};