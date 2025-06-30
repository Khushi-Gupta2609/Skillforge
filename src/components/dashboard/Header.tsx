
import React, { useState, useEffect } from 'react';
import { Search, LogOut, X, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { useUserData } from '../../hooks/useUserData';
import { Link } from 'react-router-dom';


interface HeaderProps {
  onMenuClick?: () => void;
  // New prop to indicate if the sidebar is open
  isSidebarOpen?: boolean; 
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isSidebarOpen }) => {
  const { currentUser, userProfile, signOut } = useAuth();
  const { goals = [], roadmaps = [], interviews = [] } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    if (Array.isArray(goals)) {
      goals.forEach(goal => {
        if (goal.title.toLowerCase().includes(query) ||
            (goal.description && goal.description.toLowerCase().includes(query))) {
          results.push({
            type: 'goal',
            id: goal.id,
            title: goal.title,
            description: goal.description,
            completed: goal.completed,
            targetDate: goal.targetDate
          });
        }
      });
    }

    if (Array.isArray(roadmaps)) {
      roadmaps.forEach(roadmap => {
        if (roadmap.title.toLowerCase().includes(query) ||
            (roadmap.description && roadmap.description.toLowerCase().includes(query)) ||
            roadmap.skill.toLowerCase().includes(query)) {
          results.push({
            type: 'roadmap',
            id: roadmap.id,
            title: roadmap.title,
            description: roadmap.description,
            skill: roadmap.skill,
            difficulty: roadmap.difficulty,
            steps: roadmap.steps
          });
        }

        if (Array.isArray(roadmap.steps)) {
          roadmap.steps.forEach(step => {
            if (step.title.toLowerCase().includes(query) ||
                (step.description && step.description.toLowerCase().includes(query))) {
              results.push({
                type: 'roadmap-step',
                id: `${roadmap.id}-${step.id}`,
                title: step.title,
                description: step.description,
                roadmapTitle: roadmap.title,
                completed: step.completed
              });
            }
          });
        }
      });
    }

    if (Array.isArray(interviews)) {
      interviews.forEach(interview => {
        if (interview.role.toLowerCase().includes(query)) {
          results.push({
            type: 'interview',
            id: interview.id,
            title: `${interview.role} Interview`,
            description: `Score: ${interview.score ?? 'N/A'}/100`,
            role: interview.role,
            score: interview.score,
            createdAt: interview.createdAt
          });
        }

        if (Array.isArray(interview.questions)) {
          interview.questions.forEach((question, index) => {
            if (question.question.toLowerCase().includes(query) ||
                (question.answer && question.answer.toLowerCase().includes(query))) {
              results.push({
                type: 'interview-question',
                id: `${interview.id}-${question.id}`,
                title: `Q${index + 1}: ${question.question.substring(0, Math.min(question.question.length, 50))}${question.question.length > 50 ? '...' : ''}`,
                description: `From ${interview.role} interview`,
                interviewRole: interview.role,
                question: question.question,
                answer: question.answer
              });
            }
          });
        }
      });
    }

    setSearchResults(results.slice(0, 10));
    setShowSearchResults(results.length > 0);
  }, [searchQuery, goals, roadmaps, interviews]);

  const handleSearchResultClick = (result: any) => {
    const baseUrl = '/dashboard';
    let targetUrl = baseUrl;

    switch (result.type) {
      case 'goal':
        targetUrl = `${baseUrl}/goals`;
        break;
      case 'roadmap':
      case 'roadmap-step':
        targetUrl = `${baseUrl}/roadmaps`;
        break;
      case 'interview':
      case 'interview-question':
        targetUrl = `${baseUrl}/interview`;
        break;
      default:
        break;
    }

    window.location.href = targetUrl;
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'goal': return '🎯';
      case 'roadmap': return '🗺️';
      case 'roadmap-step': return '📚';
      case 'interview': return '🎤';
      case 'interview-question': return '❓';
      default: return '📄';
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'goal': return 'Goal';
      case 'roadmap': return 'Roadmap';
      case 'roadmap-step': return 'Learning Step';
      case 'interview': return 'Mock Interview';
      case 'interview-question': return 'Interview Question';
      default: return 'Result';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      <div className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 flex items-center justify-between">
        {/* Mobile menu button */}
        <div className="lg:hidden">
          {/* Conditionally render the Menu button only if sidebar is NOT open */}
          {!isSidebarOpen && ( 
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Search bar - responsive width */}
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg relative mx-2 sm:mx-4 md:mx-6">
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* Search results dropdown - mobile optimized */}
          {showSearchResults && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSearchResults(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-80 sm:max-h-96 overflow-y-auto">
                <div className="p-1 sm:p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 sm:px-3 py-1 sm:py-2 border-b border-gray-200 dark:border-gray-700">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full text-left p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <span className="text-sm sm:text-lg">{getResultIcon(result.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </span>
                              <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                {getResultTypeLabel(result.type)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                              {result.description}
                            </p>
                            {result.type === 'roadmap-step' && result.roadmapTitle && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                From: {result.roadmapTitle}
                              </p>
                            )}
                            {result.type === 'interview-question' && result.interviewRole && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                From: {result.interviewRole} interview
                              </p>
                            )}
                            {(result.completed !== undefined) && (
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                                  result.completed
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                }`}>
                                  {result.completed ? 'Completed' : 'In Progress'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                      No results found.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right side actions - mobile optimized */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <ThemeToggle />
          <NotificationCenter />

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/dashboard/profile"
              className="group flex items-center space-x-1 sm:space-x-2 p-1 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300 truncate max-w-24 md:max-w-none">
                  {userProfile?.displayName || currentUser?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 truncate max-w-24 md:max-w-none">
                  {userProfile?.currentRole || 'Set your role'}
                </p>
              </div>

              <div className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
                  {userProfile?.photoURL || currentUser?.photoURL ? (
                    <img
                      src={userProfile?.photoURL || currentUser?.photoURL || ''}
                      alt="Profile"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium text-xs sm:text-sm">
                      {(userProfile?.displayName || currentUser?.displayName || 'U')[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                <div className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 animate-pulse"></div>

                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 blur-md transition-all duration-300"></div>
              </div>
            </Link>

            <button
              onClick={handleSignOut}
              className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};