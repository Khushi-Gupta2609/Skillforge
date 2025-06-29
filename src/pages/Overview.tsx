import React, { useEffect, useState } from 'react';
import {  Plus, 
  Target, 
  Map, 
  MessageCircle, 
  Award, 
  Clock, 
  Zap,
  ArrowRight,
  Star,
  Trophy,
  Flame, 
  Brain,
  AlertTriangle} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { CreateGoalModal } from '../components/modals/CreateGoalModal';
import { CreateRoadmapModal } from '../components/modals/CreateRoadmapModal';
import { MockInterviewModal } from '../components/modals/MockInterviewModal';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SkillRadarChart } from '../components/analytics/SkillRadarChart';
import { LearningChart } from '../components/analytics/LearningChart';


export const Overview: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  // Ensure stats, goals, roadmaps have default empty values even if the hook briefly returns undefined
  const { stats = {}, goals = [], roadmaps = [], loading, error, refreshData } = useUserData();
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateRoadmap, setShowCreateRoadmap] = useState(false);
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for dynamic greeting
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Sample data for charts with more realistic data - using fallback values
  // Use nullish coalescing (??) to ensure a number is always available for calculations
  const learningData = [
    { date: 'Mon', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.15)) : 2, goals: 1, roadmapSteps: 2 },
    { date: 'Tue', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.18)) : 3, goals: 0, roadmapSteps: 1 },
    { date: 'Wed', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.12)) : 1, goals: 1, roadmapSteps: 3 },
    { date: 'Thu', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.22)) : 4, goals: 0, roadmapSteps: 2 },
    { date: 'Fri', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.16)) : 2, goals: 2, roadmapSteps: 1 },
    { date: 'Sat', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.10)) : 3, goals: 0, roadmapSteps: 2 },
    { date: 'Sun', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.07)) : 2, goals: 1, roadmapSteps: 1 }
  ];

  // Dynamic skills data based on user's roadmaps with fallback
  // Ensure roadmaps is an array and check its length
  const skillsData = Array.isArray(roadmaps) && roadmaps.length > 0 
    ? roadmaps.slice(0, 5).map(roadmap => {
        // Ensure roadmap.steps is an array before filtering and accessing length
        const completedSteps = (roadmap.steps || []).filter(step => step.completed).length;
        const totalSteps = (roadmap.steps || []).length || 1; // Avoid division by zero
        const progress = Math.round((completedSteps / totalSteps) * 10);
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
        { skill: 'SQL', level: 7, maxLevel: 10 }
      ];

  // Get next upcoming goal with safe array handling
  const upcomingGoals = Array.isArray(goals) && goals.length > 0
    ? goals
        .filter(goal => !goal.completed)
        .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    : [];

  // Get current active roadmap step with safe array handling
  const activeRoadmaps = Array.isArray(roadmaps) && roadmaps.length > 0
    ? roadmaps.filter(roadmap => 
        roadmap.steps && Array.isArray(roadmap.steps) && roadmap.steps.some(step => !step.completed)
      )
    : [];
  // Ensure activeRoadmaps[0] and its steps are defined before accessing
  const nextStep = activeRoadmaps.length > 0 && Array.isArray(activeRoadmaps[0]?.steps)
    ? activeRoadmaps[0].steps.find(step => !step.completed)
    : null;

  // Calculate achievement level with safe stats handling
  const getAchievementLevel = () => {
    // Use nullish coalescing to ensure numbers for calculations
    const totalPoints = (stats?.completedGoals ?? 0) * 10 + (stats?.completedSteps ?? 0) * 5 + (stats?.totalInterviews ?? 0) * 15;
    if (totalPoints >= 200) return { level: 'Expert', icon: Trophy, color: 'text-yellow-500' };
    if (totalPoints >= 100) return { level: 'Advanced', icon: Star, color: 'text-purple-500' };
    if (totalPoints >= 50) return { level: 'Intermediate', icon: Award, color: 'text-blue-500' };
    return { level: 'Beginner', icon: Target, color: 'text-green-500' };
  };

  const achievement = getAchievementLevel();

  // Show error state if there's an error from useUserData
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message || "An unknown error occurred. Please try again."} {/* Display error message */}
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Dynamic Greeting */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {getGreeting()}, {userProfile?.displayName || currentUser?.displayName || 'there'}! 👋
              </h1>
              <p className="text-xl text-purple-100 mb-4">
                Ready to continue your learning journey?
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-300" />
                  <span className="text-purple-100">{stats?.learningStreak ?? 0} day streak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                  <span className="text-purple-100">{achievement.level} Level</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-300" />
                  <span className="text-purple-100">{stats?.weeklyHours ?? 0}h this week</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => setShowCreateGoal(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Goal</span>
              </button>
              <button
                onClick={() => setShowCreateRoadmap(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>AI Roadmap</span>
              </button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      </div>

      {/* Enhanced Stats Grid with Safe Data Handling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalGoals ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Goals</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.completedGoals ?? 0}/{(stats?.totalGoals ?? 0) === 0 ? 0 : (stats?.totalGoals ?? 0)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats && (stats.totalGoals ?? 0) > 0 ? ((stats.completedGoals ?? 0) / (stats.totalGoals ?? 0)) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Map className="w-7 h-7 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.activeRoadmaps ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learning Paths</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.progressPercentage ?? 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats?.progressPercentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalInterviews ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mock Interviews</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Avg Score</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.avgInterviewScore ?? 0}/100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats?.avgInterviewScore ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.learningStreak ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">This Week</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.weeklyHours ?? 0}h</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((stats?.weeklyHours ?? 0) / 20) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Zap className="w-4 h-4" />
            <span>Boost your learning</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setShowCreateGoal(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-6 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Set New Goal</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Define your next milestone and track progress</p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowCreateRoadmap(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border border-green-200 dark:border-green-700 rounded-2xl p-6 hover:from-green-100 hover:to-emerald-200 dark:hover:from-green-800/30 dark:hover:to-emerald-700/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Roadmap</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Generate personalized learning path with AI</p>
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                  <span>Create now</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowMockInterview(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Mock Interview</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Practice with AI-powered interview sessions</p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <span>Start practice</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Next Action Card with Safe Data Handling */}
      {/* Conditionally render if either nextStep is available OR there are upcoming goals */}
      {((nextStep && Object.keys(nextStep).length > 0) || upcomingGoals.length > 0) && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">What's Next?</h3>
            </div>
            
            {/* Prioritize showing the next step in an active roadmap */}
            {nextStep && Object.keys(nextStep).length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Continue Learning</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{nextStep.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{nextStep.estimatedTime} • {nextStep.resources?.length ?? 0} resources</p>
                  </div>
                  <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors">
                    Continue
                  </button>
                </div>
              </div>
            ) : (upcomingGoals.length > 0 && ( /* Fallback to upcoming goals */
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Upcoming Goal</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{upcomingGoals[0].title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {/* Check if targetDate is a valid Date object before formatting */}
                      Due: {upcomingGoals[0].targetDate instanceof Date ? upcomingGoals[0].targetDate.toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors">
                    View Goal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <LearningChart data={learningData} />
        <SkillRadarChart skills={skillsData} />
      </div>

      {/* Activity Feed */}
      <ActivityFeed />

      {/* Recent Goals and Roadmaps with Safe Data Handling */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Goals</h3>
            <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          {/* Ensure goals is an array and check its length */}
          {Array.isArray(goals) && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${goal.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{goal.title}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {/* Check if targetDate is a valid Date object before formatting */}
                        Due: {goal.targetDate instanceof Date ? goal.targetDate.toLocaleDateString() : 'N/A'}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.completed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {goal.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No goals yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Set your first goal to start tracking progress</p>
              <button
                onClick={() => setShowCreateGoal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Create First Goal
              </button>
            </div>
          )}
        </div>

        {/* Recent Roadmaps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Learning Paths</h3>
            <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          {/* Ensure roadmaps is an array and check its length */}
          {Array.isArray(roadmaps) && roadmaps.length > 0 ? (
            <div className="space-y-4">
              {roadmaps.slice(0, 4).map((roadmap) => {
                // Ensure roadmap.steps is an array before filtering. Provide default for totalSteps to avoid NaN
                const completedSteps = roadmap.steps?.filter(step => step.completed).length ?? 0;
                const totalSteps = roadmap.steps?.length || 1; // Default to 1 to prevent division by zero
                const progress = Math.round((completedSteps / totalSteps) * 100);
                
                return (
                  <div key={roadmap.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{roadmap.title}</h4>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{completedSteps}/{totalSteps} steps completed</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        roadmap.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        roadmap.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {roadmap.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No roadmaps yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Create an AI-powered learning path</p>
              <button
                onClick={() => setShowCreateRoadmap(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Generate Roadmap
              </button>
            </div>
          )}
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
              <p>• Focus on completing your current roadmap - you're making great progress!</p>
              <p>• Consider taking a system design course to complement your technical skills</p>
              <p>• Your learning consistency is excellent - maintain your {stats?.learningStreak ?? 0}-day streak</p>
              <p>• Practice more mock interviews to improve your score above 80</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateGoalModal
        isOpen={showCreateGoal}
        onClose={() => setShowCreateGoal(false)}
        onGoalCreated={refreshData}
      />

      <CreateRoadmapModal
        isOpen={showCreateRoadmap}
        onClose={() => setShowCreateRoadmap(false)}
        onRoadmapCreated={refreshData}
      />

      <MockInterviewModal
        isOpen={showMockInterview}
        onClose={() => setShowMockInterview(false)}
        onInterviewCompleted={refreshData}
      />
    </div>
  );
};