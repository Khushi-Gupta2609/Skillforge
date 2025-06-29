import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Map,
  Target,
  MessageCircle,
  User,
  // BookOpen, // This one is no longer needed if you're replacing it with an image
  TrendingUp,
  BarChart3
} from 'lucide-react';

// Import your logo image - Make sure the path is correct!
import MyLogo from '../../../src/assets/skillfroge.png'; //

const navigationItems = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Roadmaps', href: '/dashboard/roadmaps', icon: Map },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Mock Interview', href: '/dashboard/interview', icon: MessageCircle },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          {/* Replaced the BookOpen icon with an img tag for your logo */}
          <img src={MyLogo} alt="SkillForge Logo" className="h-8 w-auto rounded-lg" /> {/* */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">SkillForge</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Career Planning</p>
          </div>
        </div>
      </div>

      <nav className="px-4 pb-4">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mb-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-700 dark:text-purple-300 border-r-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};