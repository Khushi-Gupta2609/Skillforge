import React, { useState } from 'react';
import { Map, Plus, Clock, Star, TrendingUp, CheckCircle, Play, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { DataService } from '../services/dataService';
import { CreateRoadmapModal } from '../components/modals/CreateRoadmapModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Roadmaps: React.FC = () => {
  const { currentUser } = useAuth();
  const { roadmaps, stats, loading, error, refreshData } = useUserData();
  const [showCreateRoadmap, setShowCreateRoadmap] = useState(false);
  const [updatingSteps, setUpdatingSteps] = useState<Set<string>>(new Set());
  const [deletingRoadmaps, setDeletingRoadmaps] = useState<Set<string>>(new Set());

  const handleToggleStep = async (roadmapId: string, stepId: string, completed: boolean) => {
    if (!currentUser) return;

    const stepKey = `${roadmapId}-${stepId}`;
    setUpdatingSteps(prev => new Set(prev).add(stepKey));
    
    try {
      await DataService.updateRoadmapStep(currentUser.uid, roadmapId, stepId, completed);
      refreshData();
    } catch (error) {
      console.error('Error updating roadmap step:', error);
    } finally {
      setUpdatingSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepKey);
        return newSet;
      });
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string, roadmapTitle: string) => {
    if (!currentUser || !confirm(`Are you sure you want to delete "${roadmapTitle}"? This action cannot be undone.`)) return;

    setDeletingRoadmaps(prev => new Set(prev).add(roadmapId));
    try {
      await DataService.deleteRoadmap(currentUser.uid, roadmapId);
      refreshData();
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      alert('Failed to delete roadmap. Please try again.');
    } finally {
      setDeletingRoadmaps(prev => {
        const newSet = new Set(prev);
        newSet.delete(roadmapId);
        return newSet;
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateProgress = (steps: any[]) => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
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
            Unable to Load Roadmaps
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Roadmaps</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personalized learning paths to achieve your career goals
          </p>
        </div>
        <button
          onClick={() => setShowCreateRoadmap(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Roadmap</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeRoadmaps || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Roadmaps</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.progressPercentage || 0}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.completedSteps || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Steps Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmaps List */}
      {roadmaps && roadmaps.length > 0 ? (
        <div className="space-y-6">
          {roadmaps.map((roadmap) => {
            const progress = calculateProgress(roadmap.steps);
            const completedSteps = roadmap.steps.filter(step => step.completed).length;
            const isDeleting = deletingRoadmaps.has(roadmap.id);
            
            return (
              <div key={roadmap.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {roadmap.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(roadmap.difficulty)}`}>
                        {roadmap.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {roadmap.description}
                    </p>
                    
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {completedSteps}/{roadmap.steps.length} steps
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{progress}% complete</span>
                        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{roadmap.estimatedDuration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {roadmap.skill}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDeleteRoadmap(roadmap.id, roadmap.title)}
                      disabled={isDeleting}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete roadmap"
                    >
                      {isDeleting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Learning Steps</h4>
                  {roadmap.steps.map((step, index) => {
                    const stepKey = `${roadmap.id}-${step.id}`;
                    const isUpdating = updatingSteps.has(stepKey);
                    
                    return (
                      <div key={step.id} className={`flex items-start space-x-4 p-4 rounded-lg border ${
                        step.completed 
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step.completed 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}>
                            {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <button
                            onClick={() => handleToggleStep(roadmap.id, step.id, !step.completed)}
                            disabled={isUpdating}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              step.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isUpdating ? (
                              <LoadingSpinner size="sm" />
                            ) : step.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : null}
                          </button>
                        </div>
                        
                        <div className="flex-1">
                          <h5 className={`font-medium mb-1 ${
                            step.completed 
                              ? 'line-through text-gray-500 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {step.title}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {step.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{step.estimatedTime}</span>
                            </div>
                            <span>{step.resources.length} resources</span>
                          </div>
                          
                          {/* Resources */}
                          {step.resources.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {step.resources.map((resource) => (
                                <a
                                  key={resource.id}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>{resource.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl p-8 text-center border border-purple-200 dark:border-purple-800">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Create Your First Roadmap
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Use AI to generate a personalized learning path based on your goals and current skill level
          </p>
          <button
            onClick={() => setShowCreateRoadmap(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Get Started with AI
          </button>
        </div>
      )}

      <CreateRoadmapModal
        isOpen={showCreateRoadmap}
        onClose={() => setShowCreateRoadmap(false)}
        onRoadmapCreated={refreshData}
      />
    </div>
  );
};