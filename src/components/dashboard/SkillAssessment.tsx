import React, { useState, useEffect } from 'react';
import { Brain, ChevronRight, CheckCircle, X, Sparkles } from 'lucide-react';
import { AIService } from '../../services/aiService';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface SkillAssessmentProps {
  skill: string;
  onComplete: (score: number, feedback: string) => void;
  onClose: () => void;
}

export const SkillAssessment: React.FC<SkillAssessmentProps> = ({ skill, onComplete, onClose }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [skill]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const assessmentQuestions = await AIService.generateSkillAssessment(skill);
      
      const formattedQuestions: Question[] = assessmentQuestions.map((q, index) => ({
        id: `question-${index + 1}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));
      
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback questions
      setQuestions([
        {
          id: '1',
          question: `What is the primary purpose of ${skill}?`,
          options: [
            'Building user interfaces',
            'Database management',
            'Server configuration',
            'Network security'
          ],
          correctAnswer: 0,
          explanation: `${skill} is primarily used for building interactive user interfaces.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishAssessment(newAnswers);
    }
  };

  const finishAssessment = async (finalAnswers: number[]) => {
    setEvaluating(true);
    
    // Calculate score
    let correctAnswers = 0;
    finalAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    
    // Generate AI feedback
    let feedback = `${skill} Assessment Results\n\n`;
    feedback += `Score: ${score}/100 (${correctAnswers}/${questions.length} correct)\n\n`;
    
    if (score >= 80) {
      feedback += "🎉 Excellent! You have a strong understanding of " + skill + " fundamentals.\n\n";
      feedback += "Recommendations:\n";
      feedback += "• Work on advanced projects\n";
      feedback += "• Contribute to open source\n";
      feedback += "• Mentor others in the community";
    } else if (score >= 60) {
      feedback += "👍 Good job! You have a solid foundation in " + skill + ".\n\n";
      feedback += "Recommendations:\n";
      feedback += "• Practice with more complex examples\n";
      feedback += "• Build real-world projects\n";
      feedback += "• Review areas where you missed questions";
    } else if (score >= 40) {
      feedback += "📚 You're on the right track with " + skill + "!\n\n";
      feedback += "Recommendations:\n";
      feedback += "• Focus on fundamental concepts\n";
      feedback += "• Take a structured course\n";
      feedback += "• Practice with guided tutorials";
    } else {
      feedback += "🌱 Great start! Keep learning " + skill + ".\n\n";
      feedback += "Recommendations:\n";
      feedback += "• Start with beginner tutorials\n";
      feedback += "• Focus on basic concepts first\n";
      feedback += "• Practice regularly with simple exercises";
    }

    setTimeout(() => {
      setEvaluating(false);
      setShowResults(true);
      onComplete(score, feedback);
    }, 2000);
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Generating Assessment
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Creating personalized {skill} questions with AI...
          </p>
        </div>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Evaluating Your Answers
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing your responses and generating personalized feedback...
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return null; // Results are handled by parent component
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Assessment Unavailable
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to generate assessment questions for {skill}.
          </p>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {skill} Assessment
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white">{option}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentQuestion > 0 && (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  Previous Question
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Progress: {currentQuestion + 1}/{questions.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};