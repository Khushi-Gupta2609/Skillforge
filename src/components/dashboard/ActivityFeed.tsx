import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Target, BookOpen, MessageCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DataService } from '../../services/dataService';

interface Activity {
  id: string;
  type: 'goal_completed' | 'roadmap_step' | 'interview_completed' | 'roadmap_created' | 'goal_created';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

export const ActivityFeed: React.FC = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadActivities();
    }
  }, [currentUser]);

  const loadActivities = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      console.log('🔄 Loading activities for user:', currentUser.uid);
      const userActivities = await DataService.getUserActivities(currentUser.uid);
      console.log('📋 Loaded activities:', userActivities.length);
      setActivities(userActivities);
    } catch (error) {
      console.error('❌ Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'goal_completed': return CheckCircle;
      case 'roadmap_step': return BookOpen;
      case 'interview_completed': return MessageCircle;
      case 'roadmap_created': return Target;
      case 'goal_created': return TrendingUp;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'goal_completed': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'roadmap_step': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'interview_completed': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20';
      case 'roadmap_created': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'goal_created': return 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
      
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.slice(0, 10).map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            const colorClasses = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {/* Ensure timestamp is a Date object */}
                    {activity.timestamp instanceof Date ? formatTimeAgo(activity.timestamp) : 'N/A'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Start creating goals and roadmaps to see your progress here
          </p>
        </div>
      )}
    </div>
  );
};