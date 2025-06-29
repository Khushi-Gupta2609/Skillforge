import React, { useState } from 'react';
import { MessageCircle, Play, Clock, Award, TrendingUp, Calendar, AlertTriangle, Plus, Eye, RotateCcw, Trash2, X } from 'lucide-react';
import { useUserData } from '../hooks/useUserData';
import { MockInterviewModal } from '../components/modals/MockInterviewModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth here

export const MockInterview: React.FC = () => {
  const { currentUser } = useAuth();
  // Destructure with default values to prevent crashes if data is briefly null/undefined
  const { interviews = [], stats = {}, loading, error, refreshData } = useUserData(); 
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [deletingInterviews, setDeletingInterviews] = useState<Set<string>>(new Set());
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [retryInterview, setRetryInterview] = useState<any>(null);

  const handleDeleteInterview = async (interviewId: string, role: string) => {
    if (!currentUser || !confirm(`Are you sure you want to delete the ${role} interview? This action cannot be undone.`)) return;

    setDeletingInterviews(prev => new Set(prev).add(interviewId));
    try {
      await DataService.deleteMockInterview(currentUser.uid, interviewId);
      refreshData();
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview. Please try again.');
    } finally {
      setDeletingInterviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(interviewId);
        return newSet;
      });
    }
  };

  const handleViewDetails = (interview: any) => {
    setSelectedInterview(interview);
    setShowDetails(true);
  };

  const handleRetryInterview = (interview: any) => {
    setRetryInterview({
      role: interview.role,
      questions: (interview.questions || []).map((q: any) => ({ ...q, answer: '' })) // Clear previous answers, ensure questions is an array
    });
    setShowMockInterview(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 70) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
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
            Unable to Load Data
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mock Interviews</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Practice with AI-powered interview sessions
          </p>
        </div>
        <button
          onClick={() => {
            setRetryInterview(null);
            setShowMockInterview(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Start Interview</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              {/* Use nullish coalescing for stats properties */}
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalInterviews ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              {/* Use nullish coalescing for stats properties */}
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.avgInterviewScore ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              {/* Ensure interviews is an array before filtering */}
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Array.isArray(interviews) ? interviews.filter(i => (i.score ?? 0) >= 80).length : 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Excellent Scores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interview History */}
      {/* Ensure interviews is an array and check its length */}
      {Array.isArray(interviews) && interviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Interview History</h3>
          {interviews.map((interview) => {
            const isDeleting = deletingInterviews.has(interview.id);
            
            return (
              <div key={interview.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {interview.role} Interview
                      </h4>
                      {/* Use nullish coalescing for score */}
                      {interview.score !== undefined && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(interview.score ?? 0)}`}>
                          {interview.score ?? 0}/100
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        {/* Check if createdAt is a Date object */}
                        <span>{interview.createdAt instanceof Date ? interview.createdAt.toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {/* Ensure questions is an array before checking length */}
                      <span>{(interview.questions || []).length} questions</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Use nullish coalescing for score */}
                    {interview.score !== undefined && (
                      <div className={`text-3xl font-bold ${getScoreColor(interview.score ?? 0)}`}>
                        {interview.score ?? 0}
                      </div>
                    )}
                  </div>
                </div>

                {interview.feedback && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Feedback</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {/* Safely access feedback length */}
                      {interview.feedback.length > 200 
                        ? `${interview.feedback.substring(0, 200)}...` 
                        : interview.feedback
                      }
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Questions Preview</h5>
                  {/* Ensure questions is an array before slicing and mapping */}
                  {(interview.questions || []).slice(0, 2).map((question, index) => (
                    <div key={question.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Q{index + 1}: {question.question}
                      </p>
                      {question.answer && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {/* Safely access answer length */}
                          A: {question.answer.length > 100 
                            ? `${question.answer.substring(0, 100)}...` 
                            : question.answer
                          }
                        </p>
                      )}
                    </div>
                  ))}
                  {/* Ensure questions is an array before checking length */}
                  {(interview.questions || []).length > 2 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      +{(interview.questions || []).length - 2} more questions
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleViewDetails(interview)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  
                  <button
                    onClick={() => handleRetryInterview(interview)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retry</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteInterview(interview.id, interview.role)}
                    disabled={isDeleting}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl p-8 text-center border border-purple-200 dark:border-purple-800">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Start Your First Mock Interview
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Practice with AI-generated questions tailored to your target role and experience level
          </p>
          <button
            onClick={() => setShowMockInterview(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Interview Practice
          </button>
        </div>
      )}

      {/* Interview Details Modal */}
      {showDetails && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedInterview.role} Interview Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {/* Check if createdAt is a Date object */}
                      {selectedInterview.createdAt instanceof Date ? selectedInterview.createdAt.toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {selectedInterview.score !== undefined && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(selectedInterview.score ?? 0)}`}>
                      Score: {selectedInterview.score ?? 0}/100
                    </span>
                  )}
                </div>

                {selectedInterview.feedback && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Overall Feedback</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {selectedInterview.feedback}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Questions & Answers</h3>
                {/* Ensure selectedInterview.questions is an array before mapping */}
                {(selectedInterview.questions || []).map((question: any, index: number) => (
                  <div key={question.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Question {index + 1}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {question.question}
                    </p>
                    {question.answer ? (
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1">Your Answer:</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {question.answer}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                        No answer provided
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleRetryInterview(selectedInterview);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Retry Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MockInterviewModal
        isOpen={showMockInterview}
        onClose={() => {
          setShowMockInterview(false);
          setRetryInterview(null);
        }}
        onInterviewCompleted={() => {
          refreshData();
          setRetryInterview(null);
        }}
        retryData={retryInterview}
      />
    </div>
  );
};