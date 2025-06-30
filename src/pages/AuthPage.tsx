import React, { useState } from 'react';
// Corrected: Removed .tsx extension from AuthForm import for resolution
import { AuthForm } from '../components/auth/AuthForm'; 
import { TrendingUp, Target, Users } from 'lucide-react'; 

// Corrected: Logo import path and style matching Sidebar.tsx
// IMPORTANT: Ensure 'skillfroge.png' is located at 'src/assets/skillfroge.png' for this path to work.
import MyLogo from '../assets/skillfroge.png'; 

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const features = [
    {
      icon: TrendingUp, 
      title: 'Personalized Learning',
      description: 'AI-powered roadmaps tailored to your career goals'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your skill development with detailed analytics'
    },
    {
      icon: Target,
      title: 'Set Goals',
      description: 'Define and achieve your career milestones'
    },
    {
      icon: Users,
      title: 'Mock Interviews',
      description: 'Practice with AI-generated interview questions'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen">
          {/* Left side - Branding and features */}
          <div className="lg:w-1/2 lg:pr-12 mb-6 sm:mb-8 lg:mb-0 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              {/* Logo display matching Sidebar.tsx styling */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <img 
                  src={MyLogo} 
                  alt="SkillForge Logo" 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white object-contain" 
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">SkillForge</h1>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base">Career Planning Platform</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6">
              Transform Your
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block sm:inline"> Career Journey</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0">
              Get personalized learning roadmaps, track your progress, and ace your interviews with AI-powered guidance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-lg mx-auto lg:mx-0">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3 text-left p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="lg:w-1/2 max-w-sm sm:max-w-md w-full px-2 sm:px-0">
            <AuthForm
              mode={authMode}
              onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
