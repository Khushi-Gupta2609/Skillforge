import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Target, Clock, TrendingUp, X } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';

export const MinimizableProgressBar: React.FC = () => {
  const { stats, goals, roadmaps } = useUserData();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Calculate current progress based on real data
  const weeklyGoalProgress = stats.weeklyHours > 0 ? Math.min(100, (stats.weeklyHours / 20) * 100) : 0;
  const overallProgress = stats.progressPercentage;
  
  // Get current active goal
  const activeGoals = goals.filter(goal => !goal.completed);
  const nextGoal = activeGoals.length > 0 ? activeGoals[0] : null;
  
  // Get current roadmap step
  const activeRoadmaps = roadmaps.filter(roadmap => 
    roadmap.steps.some(step => !step.completed)
  );
  const currentRoadmap = activeRoadmaps.length > 0 ? activeRoadmaps[0] : null;
  const nextStep = currentRoadmap?.steps.find(step => !step.completed);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
      isMinimized ? 'translate-y-0' : 'translate-y-0'
    }`}>
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Minimized View */}
        {isMinimized ? (
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {overallProgress}% Complete
                  </span>
                </div>
                
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>

                {nextGoal && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Target className="w-4 h-4" />
                    <span>Next: {nextGoal.title}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Expanded View */
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Progress
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Overall Progress
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {overallProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.completedSteps}/{stats.totalSteps} steps completed
                </div>
              </div>

              {/* Weekly Goal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weekly Learning Goal
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.weeklyHours}/20h
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${weeklyGoalProgress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.max(0, 20 - stats.weeklyHours)} hours remaining this week
                </div>
              </div>

              {/* Next Action */}
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Next Action
                </span>
                {nextStep ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {nextStep.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {currentRoadmap?.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : nextGoal ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {nextGoal.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Due: {nextGoal.targetDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    All caught up! Create a new goal or roadmap.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};