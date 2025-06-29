import React, { useState } from 'react';
import { X, Map, User, Target, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DataService } from '../../services/dataService';
import { AIService } from '../../services/aiService';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface CreateRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoadmapCreated: () => void;
}

export const CreateRoadmapModal: React.FC<CreateRoadmapModalProps> = ({
  isOpen,
  onClose,
  onRoadmapCreated
}) => {
  const { currentUser } = useAuth();
  const [skill, setSkill] = useState('');
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !skill.trim() || !targetRole.trim()) return;

    try {
      setLoading(true);
      setGeneratingStep('Analyzing your requirements...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGeneratingStep('Generating personalized roadmap with AI...');
      
      console.log('🚀 Creating roadmap:', { skill: skill.trim(), currentLevel, targetRole: targetRole.trim() });
      
      // Generate roadmap using AI service (Gemini)
      const roadmapData = await AIService.generateRoadmap(skill.trim(), currentLevel, targetRole.trim());
      
      console.log('✅ Roadmap generated:', roadmapData);
      
      setGeneratingStep('Saving your roadmap...');
      
      // Save to database
      const roadmapId = await DataService.createRoadmap(currentUser.uid, roadmapData);
      
      console.log('💾 Roadmap saved with ID:', roadmapId);

      // Reset form
      setSkill('');
      setCurrentLevel('beginner');
      setTargetRole('');
      
      // Notify parent component
      onRoadmapCreated();
      onClose();
      
      console.log('🎉 Roadmap creation completed successfully!');
    } catch (error) {
      console.error('❌ Error creating roadmap:', error);
      alert('Failed to create roadmap. Please try again.');
    } finally {
      setLoading(false);
      setGeneratingStep('');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSkill('');
      setCurrentLevel('beginner');
      setTargetRole('');
      setGeneratingStep('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI-Powered Roadmap
            </h2>
          </div>
          {!loading && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LoadingSpinner size="md" className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Creating Your Roadmap
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {generatingStep}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This may take a few moments...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skill to Learn
              </label>
              <div className="relative">
                <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., React, Python, Machine Learning"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Level
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Role
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Frontend Developer, Data Scientist"
                  required
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                    AI-Powered Roadmap Generation
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Our advanced AI will analyze your inputs and create a personalized learning roadmap with step-by-step guidance, curated resources, and realistic timelines.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !skill.trim() || !targetRole.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};