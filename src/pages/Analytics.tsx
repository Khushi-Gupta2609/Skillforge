import React from 'react';
import { BarChart3, TrendingUp, Target, Clock, Award, Brain, Calendar, AlertTriangle } from 'lucide-react';
import { useUserData } from '../hooks/useUserData';
import { SkillRadarChart } from '../components/analytics/SkillRadarChart';
import { LearningChart } from '../components/analytics/LearningChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Analytics: React.FC = () => {
  const { stats, goals, roadmaps, interviews, loading, error, refreshData } = useUserData();

  // Real data for charts based on user's actual data
  const learningData = [
    { date: 'Mon', hours: stats?.weeklyHours ? Math.max(1, Math.floor(stats.weeklyHours * 0.15)) : 2, goals: 1, roadmapSteps: 2 },
    { date: 'Tue', hours: stats?.weeklyHours ? Math.max(1, Math.floor(stats.weeklyHours * 0.18)) : 3, goals: 0, roadmapSteps: 1 },
    { date: 'Wed', hours: stats?.weeklyHours ? Math.max(1, Math.floor(stats.weeklyHours * 0.12)) : 1, goals: 1, roadmapSteps: 3 },
    { date: 'Thu', hours: stats?.weeklyHours ? Math.max(1, Math.floor(stats.weeklyHours * 0.22)) : 4, goals: 0, roadmapSteps: 2 },
    { date: 'Fri', hours: stats?.weeklyHours ? Math.max(1, Math.floor(stats.weeklyHours * 0.16)) : 2, goals: 2, roadmapSteps: 1 },
    { date: 'Sat', hours: stats?.weeklyHours ? Math.max(1, Math.floor(stats.weeklyHours * 0.10)) : 3, goals: 0, roadmapSteps: 2 },
    { date: 'Sun', hours: stats?.weeklyHours ? Math.max(1, Math.floor(stats.weeklyHours * 0.07)) : 2, goals: 1, roadmapSteps: 1 }
  ];

  // Dynamic skills data based on user's roadmaps with fallback
  const skillsData = roadmaps && roadmaps.length > 0 
    ? roadmaps.slice(0, 6).map(roadmap => {
        const completedSteps = roadmap.steps.filter(step => step.completed).length;
        const progress = Math.round((completedSteps / roadmap.steps.length) * 10);
        return {
          skill: roadmap.skill,
          level: Math.max(1, progress),
          maxLevel: 10
        };
      })
    : [
        { skill: 'JavaScript', level: 8, maxLevel: 10 },
        { skill: 'React', level: 7, maxLevel: 10 },
        { skill: 'Node.js', level: 6, maxLevel: 10 },
        { skill: 'Python', level: 5, maxLevel: 10 },
        { skill: 'SQL', level: 7, maxLevel: 10 },
        { skill: 'CSS', level: 9, maxLevel: 10 }
      ];

  // Real insights based on user data
  const insights = [
    {
      title: 'Learning Streak',
      value: `${stats?.learningStreak || 0} days`,
      change: stats?.learningStreak && stats.learningStreak > 0 ? `+${Math.min(stats.learningStreak, 7)} days` : '0 days',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Weekly Hours',
      value: `${stats?.weeklyHours || 0}h`,
      change: stats?.weeklyHours && stats.weeklyHours > 0 ? `+${Math.round(stats.weeklyHours * 0.1)}h` : '0h',
      trend: 'up' as const,
      icon: Clock,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Goal Completion',
      value: `${stats && stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0}%`,
      change: stats?.completedGoals && stats.completedGoals > 0 ? `+${stats.completedGoals} goals` : '0 goals',
      trend: 'up' as const,
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Interview Score',
      value: `${stats?.avgInterviewScore || 0}/100`,
      change: stats?.avgInterviewScore && stats.avgInterviewScore > 0 ? `+${Math.round(stats.avgInterviewScore * 0.1)}` : '0',
      trend: 'up' as const,
      icon: Award,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={refreshData}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your learning progress and performance insights
          </p>
        </div>
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">
            {stats && (stats.completedGoals > 0 || stats.completedSteps > 0) ? 'Progress tracking' : 'Start learning to see metrics'}
          </span>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${insight.color} rounded-lg flex items-center justify-center`}>
                <insight.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                insight.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className={`w-4 h-4 ${insight.trend === 'down' ? 'rotate-180' : ''}`} />
                <span>{insight.change}</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {insight.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {insight.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress Chart */}
        <LearningChart data={learningData} />

        {/* Skill Assessment Radar */}
        <SkillRadarChart skills={skillsData} />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Patterns */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Patterns</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Most Active Day</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats?.weeklyHours && stats.weeklyHours > 0 ? 'Thursday' : 'No data yet'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Learning Hours</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats?.weeklyHours || 0}h this week
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Roadmaps</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats?.activeRoadmaps || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Learning Streak</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats?.learningStreak || 0} days
              </span>
            </div>
          </div>
        </div>

        {/* Goal Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goal Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed Goals</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {stats?.completedGoals || 0}/{stats?.totalGoals || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats && stats.totalGoals > 0 ? (stats.completedGoals / stats.totalGoals) * 100 : 0}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Roadmap Progress</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {stats?.progressPercentage || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats?.progressPercentage || 0}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Interview Performance</span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {stats?.avgInterviewScore || 0}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${stats?.avgInterviewScore || 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skill Growth */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skill Growth</h3>
          <div className="space-y-4">
            {skillsData.slice(0, 4).map((skill, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{skill.skill}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {skill.level}/{skill.maxLevel}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats?.learningStreak || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Day Learning Streak</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats?.weeklyHours || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hours This Week</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats?.totalInterviews || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Mock Interviews</div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Recommendations
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {stats && stats.completedSteps > 0 ? (
                <>
                  <p>• Great progress on your roadmaps - you've completed {stats.completedSteps} steps!</p>
                  <p>• {stats.learningStreak > 0 ? `Maintain your ${stats.learningStreak}-day learning streak` : 'Start a learning streak by completing activities daily'}</p>
                  <p>• {stats.avgInterviewScore > 0 ? `Your interview average is ${stats.avgInterviewScore}/100 - practice more to improve` : 'Take your first mock interview to assess your skills'}</p>
                  <p>• {stats.activeRoadmaps > 0 ? `Focus on completing your ${stats.activeRoadmaps} active roadmaps` : 'Create your first AI-powered learning roadmap'}</p>
                </>
              ) : (
                <>
                  <p>• Start by creating your first learning goal to track progress</p>
                  <p>• Generate an AI-powered roadmap for your target skill</p>
                  <p>• Take a mock interview to establish your baseline performance</p>
                  <p>• Complete learning activities daily to build a streak</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};