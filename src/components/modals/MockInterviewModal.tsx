import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DataService } from '../../services/dataService';
import { AIService } from '../../services/aiService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { InterviewQuestion } from '../../types';


interface MockInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInterviewCompleted: () => void;
  retryData?: {
    role: string;
    questions: InterviewQuestion[];
  } | null;
}

export const MockInterviewModal: React.FC<MockInterviewModalProps> = ({
  isOpen,
  onClose,
  onInterviewCompleted,
  retryData
}) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<'setup' | 'interview' | 'evaluating' | 'results'>('setup');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ feedback: string; score: number } | null>(null);
  const [error, setError] = useState('');

  // Initialize with retry data if provided
  useEffect(() => {
    if (retryData && isOpen) {
      setRole(retryData.role);
      setQuestions(retryData.questions);
      setStep('interview');
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      setResults(null);
      setError('');
    }
  }, [retryData, isOpen]);

  const startInterview = async () => {
    if (!role.trim() || !experience.trim()) return;

    try {
      setLoading(true);
      setError('');
      console.log('🎤 Starting interview:', { role: role.trim(), experience: experience.trim() });
      
      const interviewData = await AIService.generateMockInterview(role.trim(), experience.trim());
      console.log('✅ Interview questions generated:', interviewData.questions.length);
      
      if (!interviewData.questions || interviewData.questions.length === 0) {
        throw new Error('No questions were generated. Please try again.');
      }
      
      setQuestions(interviewData.questions);
      setStep('interview');
    } catch (error: any) {
      console.error('❌ Error starting interview:', error);
      setError('Failed to generate interview questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;

    console.log(`📝 Answer submitted for question ${currentQuestionIndex + 1}:`, currentAnswer.trim());

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      answer: currentAnswer.trim()
    };
    setQuestions(updatedQuestions);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishInterview(updatedQuestions);
    }
  };

  const finishInterview = async (finalQuestions: InterviewQuestion[]) => {
    if (!currentUser) return;

    try {
      setStep('evaluating');
      setError('');
      console.log('🔍 Evaluating interview with', finalQuestions.length, 'questions');
      
      // Add a small delay to show the evaluating state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Evaluate the interview
      const evaluation = await AIService.evaluateInterview(finalQuestions);
      console.log('✅ Interview evaluated:', evaluation);
      
      if (!evaluation || typeof evaluation.score !== 'number') {
        throw new Error('Invalid evaluation result');
      }
      
      setResults(evaluation);

      // Save to database
      const interviewId = await DataService.saveMockInterview(currentUser.uid, {
        role,
        questions: finalQuestions,
        feedback: evaluation.feedback,
        score: evaluation.score
      });

      console.log('💾 Interview saved with ID:', interviewId);

      setStep('results');
      onInterviewCompleted();
      
      console.log('🎉 Interview completed successfully!');
    } catch (error: any) {
      console.error('❌ Error finishing interview:', error);
      setError('Failed to evaluate interview. Your answers have been saved, but evaluation is unavailable.');
      
      // Still save the interview without evaluation
      try {
        await DataService.saveMockInterview(currentUser.uid, {
          role,
          questions: finalQuestions,
          feedback: 'Evaluation unavailable due to technical issues.',
          score: 0
        });
        
        setResults({
          feedback: 'Your interview has been saved, but automatic evaluation is currently unavailable. Please try again later for detailed feedback.',
          score: 0
        });
        
        setStep('results');
        onInterviewCompleted();
      } catch (saveError) {
        console.error('❌ Error saving interview:', saveError);
        setError('Failed to save interview. Please try again.');
      }
    }
  };

  const resetInterview = () => {
    setStep('setup');
    setRole('');
    setExperience('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setResults(null);
    setError('');
  };

  const handleClose = () => {
    if (!loading && step !== 'evaluating') {
      resetInterview();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {step === 'setup' && 'Mock Interview Setup'}
              {step === 'interview' && `Question ${currentQuestionIndex + 1} of ${questions.length}`}
              {step === 'evaluating' && 'Evaluating Your Answers'}
              {step === 'results' && 'Interview Results'}
            </h2>
            {!loading && step !== 'evaluating' && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {step === 'setup' && !retryData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Frontend Developer, Data Scientist"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience Level
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                  disabled={loading}
                >
                  <option value="">Select experience level</option>
                  <option value="junior">Junior (0-2 years)</option>
                  <option value="mid">Mid-level (2-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🎯 This mock interview will include 5 questions tailored to your role and experience level. 
                  Take your time to provide thoughtful answers.
                </p>
              </div>

              <button
                onClick={startInterview}
                disabled={loading || !role.trim() || !experience.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <MessageCircle className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Generating Questions...' : 'Start Interview'}
              </button>
            </div>
          )}

          {step === 'interview' && questions.length > 0 && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {questions[currentQuestionIndex].question}
                </h3>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Type your answer here..."
                  rows={6}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Progress: {currentQuestionIndex + 1} / {questions.length}
                </div>
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!currentAnswer.trim() || loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                </button>
              </div>
            </div>
          )}

          {step === 'evaluating' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <LoadingSpinner size="lg" className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Evaluating Your Answers
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our AI is analyzing your responses and generating personalized feedback...
              </p>
              <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                This may take a few moments...
              </p>
            </div>
          )}

          {step === 'results' && results && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Interview Complete!
                </h3>
                <div className={`text-4xl font-bold mb-4 ${
                  results.score >= 80 ? 'text-green-600 dark:text-green-400' :
                  results.score >= 70 ? 'text-blue-600 dark:text-blue-400' :
                  results.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {results.score}/100
                </div>
                {results.score > 0 && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {results.score >= 80 ? '🌟 Excellent Performance!' :
                     results.score >= 70 ? '👍 Good Performance!' :
                     results.score >= 60 ? '📚 Room for Improvement' :
                     '🌱 Keep Learning!'}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Detailed Feedback</h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-64 overflow-y-auto">
                  {results.feedback}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetInterview}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Take Another Interview
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};