import React, { useState } from 'react';
import { Target, Plus, Calendar, CheckCircle, Clock, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { DataService } from '../services/dataService';
import { CreateGoalModal } from '../components/modals/CreateGoalModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Goals: React.FC = () => {
  const { currentUser } = useAuth();
  const { goals, stats, loading, error, refreshData } = useUserData();
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [updatingGoals, setUpdatingGoals] = useState<Set<string>>(new Set());

  const handleToggleGoal = async (goalId: string, completed: boolean) => {
    if (!currentUser) return;

    setUpdatingGoals(prev => new Set(prev).add(goalId));
    try {
      await DataService.updateGoal(currentUser.uid, goalId, { completed });
      refreshData();
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setUpdatingGoals(prev => {
        const newSet = new Set(prev);
        newSet.delete(goalId);
        return newSet;
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this goal?')) return;

    try {
      await DataService.deleteGoal(currentUser.uid, goalId);
      refreshData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const getStatusColor = (goal: any) => {
    if (goal.completed) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysRemaining < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    if (daysRemaining <= 7) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill': return Target;
      case 'career': return Calendar;
      case 'certification': return CheckCircle;
      case 'project': return Clock;
      default: return Target;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
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
            Unable to Load Goals
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Goals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your milestones and achievements
          </p>
        </div>
        <button
          onClick={() => setShowCreateGoal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalGoals || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Goals</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.completedGoals || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats?.totalGoals || 0) - (stats?.completedGoals || 0)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats && stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      {goals && goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => {
            const IconComponent = getCategoryIcon(goal.category || 'skill');
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const isUpdating = updatingGoals.has(goal.id);
            
            return (
              <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-xl font-semibold ${goal.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {goal.title}
                        </h3>
                        <button
                          onClick={() => handleToggleGoal(goal.id, !goal.completed)}
                          disabled={isUpdating}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            goal.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isUpdating ? (
                            <LoadingSpinner size="sm" />
                          ) : goal.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : null}
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {goal.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDate(goal.targetDate)}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.completed ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          daysRemaining < 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          daysRemaining <= 7 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {goal.completed ? 'Completed' :
                           daysRemaining < 0 ? 'Overdue' : 
                           daysRemaining === 0 ? 'Due today' :
                           `${daysRemaining} days left`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl p-8 text-center border border-purple-200 dark:border-purple-800">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Set Your First Goal
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Define your career milestones and track your progress towards achieving them
          </p>
          <button
            onClick={() => setShowCreateGoal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      <CreateGoalModal
        isOpen={showCreateGoal}
        onClose={() => setShowCreateGoal(false)}
        onGoalCreated={refreshData}
      />
    </div>
  );
};