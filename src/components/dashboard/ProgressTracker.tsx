import React from 'react';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';

interface ProgressData {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ComponentType<any>;
}

interface ProgressTrackerProps {
  data: ProgressData[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Progress Tracker</h3>
      
      <div className="space-y-6">
        {data.map((item, index) => {
          const percentage = item.target > 0 ? Math.min((item.current / item.target) * 100, 100) : 0;
          const IconComponent = item.icon;
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.current}/{item.target} {item.unit}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{Math.round(percentage)}% complete</span>
                <span>
                  {item.target > item.current ? 
                    `${item.target - item.current} ${item.unit} remaining` : 
                    'Target achieved!'
                  }
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};