import React, { useState } from 'react';
import { User, Edit3, MapPin, Briefcase, Target, Calendar, Award, Mail, AlertTriangle, Brain, Sparkles, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { EditProfileModal } from '../components/modals/EditProfileModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AIService } from '../services/aiService';



export const Profile: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { stats, goals, roadmaps, interviews, loading, error, refreshData } = useUserData();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [generatingAISummary, setGeneratingAISummary] = useState(false);
  const [aiSummary, setAISummary] = useState<string | null>(null);
  const [showAISummary, setShowAISummary] = useState(false);

  const handleProfileUpdated = () => {
    // Refresh will happen automatically through auth context
    console.log('Profile updated');
    refreshData();
  };

  const generateAISummary = async () => {
    if (!currentUser || !userProfile) return;

    setGeneratingAISummary(true);
    try {
      // Prepare user data for AI analysis
      const userData = {
        profile: {
          displayName: userProfile.displayName,
          currentRole: userProfile.currentRole,
          targetRole: userProfile.targetRole,
          experience: userProfile.experience,
          skills: userProfile.skills,
          bio: userProfile.bio
        },
        stats: {
          totalGoals: stats?.totalGoals || 0,
          completedGoals: stats?.completedGoals || 0,
          activeRoadmaps: stats?.activeRoadmaps || 0,
          completedSteps: stats?.completedSteps || 0,
          totalSteps: stats?.totalSteps || 0,
          progressPercentage: stats?.progressPercentage || 0,
          totalInterviews: stats?.totalInterviews || 0,
          avgInterviewScore: stats?.avgInterviewScore || 0,
          learningStreak: stats?.learningStreak || 0,
          weeklyHours: stats?.weeklyHours || 0
        },
        recentActivity: {
          goalsThisMonth: goals?.filter(g => {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return g.createdAt >= monthAgo;
          }).length || 0,
          roadmapsActive: roadmaps?.length || 0,
          recentInterviews: interviews?.slice(0, 3) || []
        }
      };

      const summary = await generateUserSummary(userData);
      setAISummary(summary);
      setShowAISummary(true);
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setAISummary('Unable to generate AI summary at this time. Please try again later.');
      setShowAISummary(true);
    } finally {
      setGeneratingAISummary(false);
    }
  };

  // Generate user summary using AI or fallback
  const generateUserSummary = async (userData: any): Promise<string> => {
    try {
      // Try to use AI service for summary generation
      const prompt = `Generate a comprehensive learning profile summary for this user:

Profile: ${JSON.stringify(userData.profile)}
Statistics: ${JSON.stringify(userData.stats)}
Recent Activity: ${JSON.stringify(userData.recentActivity)}

Create a personalized summary that includes:
1. Current learning status and achievements
2. Skill development progress
3. Areas of strength
4. Recommended next steps
5. Overall learning journey assessment

Keep it encouraging and actionable, around 200-300 words.`;

      // For now, we'll use a smart fallback that analyzes the data
      return generateSmartSummary(userData);
    } catch (error) {
      return generateSmartSummary(userData);
    }
  };

  // Smart fallback summary generator
  const generateSmartSummary = (userData: any): string => {
    const { profile, stats, recentActivity } = userData;
    
    let summary = `🎯 **Learning Profile Summary for ${profile.displayName}**\n\n`;

    // Current Status
    if (profile.currentRole && profile.targetRole) {
      summary += `**Current Journey:** Transitioning from ${profile.currentRole} to ${profile.targetRole}\n`;
    } else if (profile.targetRole) {
      summary += `**Goal:** Pursuing a career as ${profile.targetRole}\n`;
    }

    // Experience Level
    if (profile.experience) {
      summary += `**Experience Level:** ${profile.experience}\n`;
    }

    summary += '\n**📊 Learning Progress:**\n';

    // Goals Achievement
    if (stats.totalGoals > 0) {
      const goalCompletionRate = Math.round((stats.completedGoals / stats.totalGoals) * 100);
      summary += `• Goals: ${stats.completedGoals}/${stats.totalGoals} completed (${goalCompletionRate}%)\n`;
    } else {
      summary += `• Goals: Ready to set your first learning goal\n`;
    }

    // Roadmap Progress
    if (stats.activeRoadmaps > 0) {
      summary += `• Learning Paths: ${stats.activeRoadmaps} active roadmaps, ${stats.progressPercentage}% overall progress\n`;
      summary += `• Steps Completed: ${stats.completedSteps}/${stats.totalSteps}\n`;
    } else {
      summary += `• Learning Paths: Ready to create your first AI-powered roadmap\n`;
    }

    // Interview Performance
    if (stats.totalInterviews > 0) {
      summary += `• Interview Practice: ${stats.totalInterviews} sessions, ${stats.avgInterviewScore}/100 average score\n`;
    } else {
      summary += `• Interview Practice: Ready for your first mock interview\n`;
    }

    // Learning Consistency
    if (stats.learningStreak > 0) {
      summary += `• Learning Streak: ${stats.learningStreak} days 🔥\n`;
    }
    if (stats.weeklyHours > 0) {
      summary += `• Weekly Activity: ${stats.weeklyHours} hours this week\n`;
    }

    // Skills Assessment
    summary += '\n**🚀 Strengths & Skills:**\n';
    if (profile.skills && profile.skills.length > 0) {
      summary += `• Technical Skills: ${profile.skills.slice(0, 5).join(', ')}\n`;
    }

    // Performance Analysis
    summary += '\n**📈 Performance Analysis:**\n';
    if (stats.progressPercentage >= 70) {
      summary += `• Excellent progress! You're consistently advancing through your learning paths.\n`;
    } else if (stats.progressPercentage >= 40) {
      summary += `• Good momentum! Keep focusing on completing your current roadmap steps.\n`;
    } else if (stats.totalGoals > 0 || stats.activeRoadmaps > 0) {
      summary += `• Getting started! Focus on building consistent learning habits.\n`;
    } else {
      summary += `• Ready to begin! Set your first goal and create a learning roadmap.\n`;
    }

    if (stats.avgInterviewScore >= 80) {
      summary += `• Strong interview performance! You're well-prepared for opportunities.\n`;
    } else if (stats.avgInterviewScore >= 60) {
      summary += `• Developing interview skills. Practice more scenarios to improve confidence.\n`;
    } else if (stats.totalInterviews > 0) {
      summary += `• Interview skills need focus. Regular practice will boost your performance.\n`;
    }

    // Recommendations
    summary += '\n**🎯 Next Steps:**\n';
    if (stats.learningStreak === 0) {
      summary += `• Start a learning streak by completing activities daily\n`;
    } else if (stats.learningStreak < 7) {
      summary += `• Extend your learning streak to build consistent habits\n`;
    }

    if (stats.activeRoadmaps === 0) {
      summary += `• Create an AI-powered roadmap for your target role\n`;
    } else if (stats.progressPercentage < 50) {
      summary += `• Focus on completing more steps in your current roadmaps\n`;
    }

    if (stats.totalInterviews < 3) {
      summary += `• Take more mock interviews to build confidence\n`;
    } else if (stats.avgInterviewScore < 75) {
      summary += `• Practice behavioral and technical interview questions\n`;
    }

    if (!profile.targetRole) {
      summary += `• Define your target role to get personalized recommendations\n`;
    }

    summary += '\n**🌟 Keep up the great work! Consistent learning leads to career success.**';

    return summary;
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Profile
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account and track your progress
          </p>
        </div>
        <button
          onClick={() => setShowEditProfile(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Edit3 className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                {userProfile?.photoURL || currentUser?.photoURL ? (
                  <img
                    src={userProfile?.photoURL || currentUser?.photoURL || ''}
                    alt="Profile"
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {(userProfile?.displayName || currentUser?.displayName || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {userProfile?.displayName || currentUser?.displayName || 'User'}
                </h2>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{currentUser?.email}</span>
                  </div>
                  
                  {userProfile?.currentRole && (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{userProfile.currentRole}</span>
                    </div>
                  )}
                  
                  {userProfile?.targetRole && (
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Target: {userProfile.targetRole}</span>
                    </div>
                  )}
                  
                  {userProfile?.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}
                  
                  {userProfile?.experience && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{userProfile.experience}</span>
                    </div>
                  )}
                </div>
                
                {userProfile?.bio && (
                  <div className="mt-4">
                    <p className="text-gray-700 dark:text-gray-300">{userProfile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.totalGoals || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.completedGoals || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Completed Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.activeRoadmaps || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Active Roadmaps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.totalInterviews || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Mock Interviews</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {userProfile?.skills && userProfile.skills.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary Button */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Profile Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get a comprehensive summary of your learning journey and personalized recommendations
                  </p>
                </div>
              </div>
              <button
                onClick={generateAISummary}
                disabled={generatingAISummary}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingAISummary ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{generatingAISummary ? 'Analyzing...' : 'Generate Summary'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Achievement Level */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Learning Level
              </h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {stats && (stats.completedGoals + stats.completedSteps) >= 50 ? 'Expert' :
                 stats && (stats.completedGoals + stats.completedSteps) >= 25 ? 'Advanced' :
                 stats && (stats.completedGoals + stats.completedSteps) >= 10 ? 'Intermediate' : 'Beginner'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats ? stats.completedGoals + stats.completedSteps : 0} achievements
              </p>
            </div>
          </div>

          {/* Real Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Goals Completed</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.completedGoals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Learning Paths</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.activeRoadmaps || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Steps Completed</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.completedSteps || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mock Interviews</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.totalInterviews || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Learning Streak</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.learningStreak || 0} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Hours</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.weeklyHours || 0}h</span>
              </div>
            </div>
          </div>

          {/* Real Progress Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${stats?.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Goal Completion</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats && stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: `${stats && stats.totalGoals > 0 ? (stats.completedGoals / stats.totalGoals) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Interview Performance</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.avgInterviewScore || 0}/100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                    style={{ width: `${stats?.avgInterviewScore || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Modal */}
      {showAISummary && aiSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI Learning Profile Summary
                  </h2>
                </div>
                <button
                  onClick={() => setShowAISummary(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                    {aiSummary}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAISummary(false)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};