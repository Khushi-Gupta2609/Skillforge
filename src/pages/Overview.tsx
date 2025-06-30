import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import {
  Plus,
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
  AlertTriangle
} from 'lucide-react';
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
  const { stats = {}, goals = [], roadmaps = [], loading, error, refreshData } = useUserData();
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateRoadmap, setShowCreateRoadmap] = useState(false);
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const learningData = [
    { date: 'Mon', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.15)) : 2, goals: 1, roadmapSteps: 2 },
    { date: 'Tue', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.18)) : 3, goals: 0, roadmapSteps: 1 },
    { date: 'Wed', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.12)) : 1, goals: 1, roadmapSteps: 3 },
    { date: 'Thu', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.22)) : 4, goals: 0, roadmapSteps: 2 },
    { date: 'Fri', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.16)) : 2, goals: 2, roadmapSteps: 1 },
    { date: 'Sat', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.10)) : 3, goals: 0, roadmapSteps: 2 },
    { date: 'Sun', hours: stats?.weeklyHours ? Math.max(1, Math.floor((stats.weeklyHours ?? 0) * 0.07)) : 2, goals: 1, roadmapSteps: 1 }
  ];

  const skillsData = Array.isArray(roadmaps) && roadmaps.length > 0
    ? roadmaps.slice(0, 5).map(roadmap => {
        const completedSteps = (roadmap.steps || []).filter(step => step.completed).length;
        const totalSteps = (roadmap.steps || []).length || 1;
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

  const upcomingGoals = Array.isArray(goals) && goals.length > 0
    ? goals
        .filter(goal => !goal.completed)
        .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    : [];

  const activeRoadmaps = Array.isArray(roadmaps) && roadmaps.length > 0
    ? roadmaps.filter(roadmap =>
        roadmap.steps && Array.isArray(roadmap.steps) && roadmap.steps.some(step => !step.completed)
      )
    : [];
  const nextStep = activeRoadmaps.length > 0 && Array.isArray(activeRoadmaps[0]?.steps)
    ? activeRoadmaps[0].steps.find(step => !step.completed)
    : null;

  const getAchievementLevel = () => {
    const totalPoints = (stats?.completedGoals ?? 0) * 10 + (stats?.completedSteps ?? 0) * 5 + (stats?.totalInterviews ?? 0) * 15;
    if (totalPoints >= 200) return { level: 'Expert', icon: Trophy, color: 'text-yellow-500' };
    if (totalPoints >= 100) return { level: 'Advanced', icon: Star, color: 'text-purple-500' };
    if (totalPoints >= 50) return { level: 'Intermediate', icon: Award, color: 'text-blue-500' };
    return { level: 'Beginner', icon: Target, color: 'text-green-500' };
  };

  const achievement = getAchievementLevel();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"> {/* Added padding */}
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message || "An unknown error occurred. Please try again."}
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
      <div className="min-h-screen flex items-center justify-center p-4"> {/* Added padding */}
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8"> {/* Adjusted vertical spacing */}
      {/* Enhanced Header with Dynamic Greeting */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white"> {/* Adjusted padding */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between"> {/* Changed to flex-col for mobile, then flex-row on lg */}
            <div className="mb-4 lg:mb-0"> {/* Added margin-bottom for mobile */}
              <h1 className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2"> {/* Adjusted font size */}
                {getGreeting()}, {userProfile?.displayName || currentUser?.displayName || 'there'}! 👋
              </h1>
              <p className="text-lg sm:text-xl text-purple-100 mb-3 sm:mb-4"> {/* Adjusted font size */}
                Ready to continue your learning journey?
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-2"> {/* Used flex-wrap and adjusted gaps for badges */}
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300" /> {/* Adjusted icon size */}
                  <span className="text-sm sm:text-base text-purple-100">{stats?.learningStreak ?? 0} day streak</span> {/* Adjusted font size */}
                </div>
                <div className="flex items-center space-x-2">
                  <achievement.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${achievement.color}`} /> {/* Adjusted icon size */}
                  <span className="text-sm sm:text-base text-purple-100">{achievement.level} Level</span> {/* Adjusted font size */}
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" /> {/* Adjusted icon size */}
                  <span className="text-sm sm:text-base text-purple-100">{stats?.weeklyHours ?? 0}h this week</span> {/* Adjusted font size */}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto mt-4 lg:mt-0"> {/* Adjusted flex direction and spacing for buttons */}
              <button
                onClick={() => setShowCreateGoal(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 w-full" /* Adjusted padding and width */
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Adjusted icon size */}
                <span className="text-sm sm:text-base">New Goal</span> {/* Adjusted font size */}
              </button>
              <button
                onClick={() => setShowCreateRoadmap(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 w-full" /* Adjusted padding and width */
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Adjusted icon size */}
                <span className="text-sm sm:text-base">AI Roadmap</span> {/* Adjusted font size */}
              </button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16 sm:-translate-y-32 sm:translate-x-32" /> {/* Adjusted size and position */}
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/5 rounded-full translate-y-12 -translate-x-12 sm:translate-y-24 sm:-translate-x-24" /> {/* Adjusted size and position */}
      </div>

      {/* Enhanced Stats Grid with Safe Data Handling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"> {/* Changed grid from 4 to 2 on md, 1 on sm */}
        <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"> {/* Adjusted padding */}
          <div className="flex items-center justify-between mb-3 sm:mb-4"> {/* Adjusted margin */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"> {/* Adjusted size */}
              <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" /> {/* Adjusted icon size */}
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalGoals ?? 0}</p> {/* Adjusted font size */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Goals</p> {/* Adjusted font size */}
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2"> {/* Adjusted spacing */}
            <div className="flex items-center justify-between text-xs sm:text-sm"> {/* Adjusted font size */}
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.completedGoals ?? 0}/{(stats?.totalGoals ?? 0) === 0 ? 0 : (stats?.totalGoals ?? 0)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2"> {/* Adjusted height */}
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-500" /* Adjusted height */
                style={{ width: `${stats && (stats.totalGoals ?? 0) > 0 ? ((stats.completedGoals ?? 0) / (stats.totalGoals ?? 0)) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"> {/* Adjusted padding */}
          <div className="flex items-center justify-between mb-3 sm:mb-4"> {/* Adjusted margin */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"> {/* Adjusted size */}
              <Map className="w-6 h-6 sm:w-7 sm:h-7 text-white" /> {/* Adjusted icon size */}
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats?.activeRoadmaps ?? 0}</p> {/* Adjusted font size */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Learning Paths</p> {/* Adjusted font size */}
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2"> {/* Adjusted spacing */}
            <div className="flex items-center justify-between text-xs sm:text-sm"> {/* Adjusted font size */}
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.progressPercentage ?? 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2"> {/* Adjusted height */}
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 sm:h-2 rounded-full transition-all duration-500" /* Adjusted height */
                style={{ width: `${stats?.progressPercentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"> {/* Adjusted padding */}
          <div className="flex items-center justify-between mb-3 sm:mb-4"> {/* Adjusted margin */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"> {/* Adjusted size */}
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" /> {/* Adjusted icon size */}
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalInterviews ?? 0}</p> {/* Adjusted font size */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mock Interviews</p> {/* Adjusted font size */}
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2"> {/* Adjusted spacing */}
            <div className="flex items-center justify-between text-xs sm:text-sm"> {/* Adjusted font size */}
              <span className="text-gray-600 dark:text-gray-400">Avg Score</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.avgInterviewScore ?? 0}/100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2"> {/* Adjusted height */}
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-500" /* Adjusted height */
                style={{ width: `${stats?.avgInterviewScore ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"> {/* Adjusted padding */}
          <div className="flex items-center justify-between mb-3 sm:mb-4"> {/* Adjusted margin */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"> {/* Adjusted size */}
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white" /> {/* Adjusted icon size */}
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats?.learningStreak ?? 0}</p> {/* Adjusted font size */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Day Streak</p> {/* Adjusted font size */}
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2"> {/* Adjusted spacing */}
            <div className="flex items-center justify-between text-xs sm:text-sm"> {/* Adjusted font size */}
              <span className="text-gray-600 dark:text-gray-400">This Week</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.weeklyHours ?? 0}h</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2"> {/* Adjusted height */}
              <div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 sm:h-2 rounded-full transition-all duration-500" /* Adjusted height */
                style={{ width: `${Math.min(100, ((stats?.weeklyHours ?? 0) / 20) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700"> {/* Adjusted padding */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6"> {/* Adjusted flex direction and margin */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">Quick Actions</h3> {/* Adjusted font size and margin */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Zap className="w-4 h-4" />
            <span>Boost your learning</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"> {/* Changed grid from 3 to 1 on sm, 3 on md */}
          <button
            onClick={() => setShowCreateGoal(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-4 sm:p-6 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" /* Adjusted padding */
          >
            <div className="flex items-start space-x-3 sm:space-x-4"> {/* Adjusted spacing */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0"> {/* Adjusted size and added flex-shrink-0 */}
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> {/* Adjusted icon size */}
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 text-base sm:text-lg">Set New Goal</h4> {/* Adjusted font size and margin */}
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">Define your next milestone and track progress</p> {/* Adjusted font size and margin */}
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowCreateRoadmap(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border border-green-200 dark:border-green-700 rounded-2xl p-4 sm:p-6 hover:from-green-100 hover:to-emerald-200 dark:hover:from-green-800/30 dark:hover:to-emerald-700/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" /* Adjusted padding */
          >
            <div className="flex items-start space-x-3 sm:space-x-4"> {/* Adjusted spacing */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0"> {/* Adjusted size and added flex-shrink-0 */}
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> {/* Adjusted icon size */}
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 text-base sm:text-lg">AI Roadmap</h4> {/* Adjusted font size and margin */}
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">Generate personalized learning path with AI</p> {/* Adjusted font size and margin */}
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                  <span>Create now</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowMockInterview(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 sm:p-6 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" /* Adjusted padding */
          >
            <div className="flex items-start space-x-3 sm:space-x-4"> {/* Adjusted spacing */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0"> {/* Adjusted size and added flex-shrink-0 */}
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> {/* Adjusted icon size */}
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 text-base sm:text-lg">Mock Interview</h4> {/* Adjusted font size and margin */}
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">Practice with AI-powered interview sessions</p> {/* Adjusted font size and margin */}
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
      {((nextStep && Object.keys(nextStep).length > 0) || upcomingGoals.length > 0) && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-0.5 sm:p-1"> {/* Adjusted padding */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6"> {/* Adjusted padding */}
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4"> {/* Adjusted spacing and margin */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center"> {/* Adjusted size */}
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> {/* Adjusted icon size */}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">What's Next?</h3> {/* Adjusted font size */}
            </div>

            {nextStep && Object.keys(nextStep).length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4"> {/* Adjusted padding */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0"> {/* Adjusted flex direction and spacing */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 text-base sm:text-lg">Continue Learning</h4> {/* Adjusted font size and margin */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">{nextStep.title}</p> {/* Adjusted font size and margin */}
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{nextStep.estimatedTime} • {nextStep.resources?.length ?? 0} resources</p> {/* Adjusted font size */}
                  </div>
                  <button 
                    onClick={() => navigate('/dashboard/roadmaps')} // Added onClick to navigate
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors w-full sm:w-auto"> {/* Adjusted width */}
                    Continue
                  </button>
                </div>
              </div>
            ) : (upcomingGoals.length > 0 && ( /* Fallback to upcoming goals */
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4"> {/* Adjusted padding */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0"> {/* Adjusted flex direction and spacing */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 text-base sm:text-lg">Upcoming Goal</h4> {/* Adjusted font size and margin */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">{upcomingGoals[0].title}</p> {/* Adjusted font size and margin */}
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                      Due: {upcomingGoals[0].targetDate instanceof Date ? upcomingGoals[0].targetDate.toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/dashboard/goals')} // Added onClick to navigate
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors w-full sm:w-auto"> {/* Adjusted width */}
                    View Goal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8"> {/* Adjusted gap */}
        <LearningChart data={learningData} />
        <SkillRadarChart skills={skillsData} />
      </div>

      {/* Activity Feed */}
      <ActivityFeed />

      {/* Recent Goals and Roadmaps with Safe Data Handling */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8"> {/* Adjusted gap */}
        {/* Recent Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"> {/* Adjusted padding */}
          <div className="flex items-center justify-between mb-4 sm:mb-6"> {/* Adjusted margin */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recent Goals</h3> {/* Adjusted font size */}
            <button 
              onClick={() => navigate('/dashboard/goals')} // Added onClick to navigate
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          {Array.isArray(goals) && goals.length > 0 ? (
            <div className="space-y-3 sm:space-y-4"> {/* Adjusted spacing */}
              {goals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"> {/* Adjusted spacing and padding */}
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 ${goal.completed ? 'bg-green-500' : 'bg-yellow-500'}`} /> {/* Adjusted size and added flex-shrink-0 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">{goal.title}</p> {/* Adjusted font size */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-0.5 sm:mt-1"> {/* Adjusted flex direction and spacing */}
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400"> {/* Adjusted font size */}
                        Due: {goal.targetDate instanceof Date ? goal.targetDate.toLocaleDateString() : 'N/A'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ /* Adjusted padding */
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
            <div className="text-center py-8 sm:py-12"> {/* Adjusted padding */}
              <Target className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" /> {/* Adjusted size and margin */}
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                Set Your First Goal
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                Define your career milestones and track your progress towards achieving them
              </p>
              <button
                onClick={() => setShowCreateGoal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base" /* Adjusted padding and font size */
              >
                Create Your First Goal
              </button>
            </div>
          )}
        </div>

        {/* Recent Roadmaps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"> {/* Adjusted padding */}
          <div className="flex items-center justify-between mb-4 sm:mb-6"> {/* Adjusted margin */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Learning Paths</h3> {/* Adjusted font size */}
            <button 
              onClick={() => navigate('/dashboard/roadmaps')} // Added onClick to navigate
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          {Array.isArray(roadmaps) && roadmaps.length > 0 ? (
            <div className="space-y-3 sm:space-y-4"> {/* Adjusted spacing */}
              {roadmaps.slice(0, 4).map((roadmap) => {
                const completedSteps = roadmap.steps?.filter(step => step.completed).length ?? 0;
                const totalSteps = roadmap.steps?.length || 1;
                const progress = Math.round((completedSteps / totalSteps) * 100);

                return (
                  <div key={roadmap.id} className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"> {/* Adjusted padding */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3"> {/* Adjusted margin */}
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{roadmap.title}</h4> {/* Adjusted font size */}
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 sm:h-2 mb-1.5 sm:mb-2"> {/* Adjusted height and margin */}
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-500" /* Adjusted height */
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400"> {/* Adjusted font size */}
                      <span>{completedSteps}/{totalSteps} steps completed</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ /* Adjusted padding */
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
            <div className="text-center py-8 sm:py-12"> {/* Adjusted padding */}
              <Map className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" /> {/* Adjusted size and margin */}
              <p className="text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 text-lg sm:text-xl">No roadmaps yet</p> {/* Adjusted font size */}
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-3 sm:mb-4">Create an AI-powered learning path</p> {/* Adjusted font size */}
              <button
                onClick={() => setShowCreateRoadmap(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base" /* Adjusted padding and font size */
              >
                Generate Roadmap
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800"> {/* Adjusted padding */}
        <div className="flex items-start space-x-3 sm:space-x-4"> {/* Adjusted spacing */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"> {/* Adjusted size and added flex-shrink-0 */}
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> {/* Adjusted icon size */}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2"> {/* Adjusted font size and margin */}
              AI Recommendations
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300"> {/* Adjusted spacing and font size */}
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