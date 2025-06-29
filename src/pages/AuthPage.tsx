import React, { useState } from 'react';
import { AuthForm } from '../components/auth/AuthForm';
import { BookOpen, TrendingUp, Target, Users } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const features = [
    {
      icon: BookOpen,
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen">
          {/* Left side - Branding and features */}
          <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SkillForge</h1>
                  <p className="text-gray-600 dark:text-gray-400">Career Planning Platform</p>
                </div>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Transform Your
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Career Journey</span>
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Get personalized learning roadmaps, track your progress, and ace your interviews with AI-powered guidance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="lg:w-1/2 max-w-md w-full">
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