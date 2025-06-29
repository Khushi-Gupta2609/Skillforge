import React, { useState, useEffect } from 'react';
import { Search, LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { useUserData } from '../../hooks/useUserData';
import { Link } from 'react-router-dom'; 

export const Header: React.FC = () => {
  const { currentUser, userProfile, signOut } = useAuth();
  // Provide default empty arrays for safety during initial loading or errors
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

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search in goals
    // Use Array.isArray() for robust check before forEach
    if (Array.isArray(goals)) { 
      goals.forEach(goal => {
        if (goal.title.toLowerCase().includes(query) || 
            (goal.description && goal.description.toLowerCase().includes(query))) { // Defensive check for description
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

    // Search in roadmaps
    if (Array.isArray(roadmaps)) {
      roadmaps.forEach(roadmap => {
        if (roadmap.title.toLowerCase().includes(query) || 
            (roadmap.description && roadmap.description.toLowerCase().includes(query)) || // Defensive check for description
            roadmap.skill.toLowerCase().includes(query)) {
          results.push({
            type: 'roadmap',
            id: roadmap.id,
            title: roadmap.title,
            description: roadmap.description,
            skill: roadmap.skill,
            difficulty: roadmap.difficulty,
            steps: roadmap.steps // Pass steps for detailed view if needed
          });
        }

        // Search in roadmap steps
        // Ensure roadmap.steps is an array before iterating
        if (Array.isArray(roadmap.steps)) { 
          roadmap.steps.forEach(step => {
            if (step.title.toLowerCase().includes(query) || 
                (step.description && step.description.toLowerCase().includes(query))) { // Defensive check for description
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

    // Search in mock interviews
    if (Array.isArray(interviews)) {
      interviews.forEach(interview => {
        if (interview.role.toLowerCase().includes(query)) {
          results.push({
            type: 'interview',
            id: interview.id,
            title: `${interview.role} Interview`,
            description: `Score: ${interview.score ?? 'N/A'}/100`, // Use nullish coalescing
            role: interview.role,
            score: interview.score,
            createdAt: interview.createdAt
          });
        }

        // Search in interview questions
        // Ensure interview.questions is an array before iterating
        if (Array.isArray(interview.questions)) {
          interview.questions.forEach((question, index) => {
            if (question.question.toLowerCase().includes(query) ||
                (question.answer && question.answer.toLowerCase().includes(query))) { // Defensive check for answer
              results.push({
                type: 'interview-question',
                id: `${interview.id}-${question.id}`,
                title: `Q${index + 1}: ${question.question.substring(0, Math.min(question.question.length, 50))}${question.question.length > 50 ? '...' : ''}`, // Safely substring and add ellipsis
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

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setShowSearchResults(results.length > 0);
  }, [searchQuery, goals, roadmaps, interviews]); // Dependencies for useEffect

  const handleSearchResultClick = (result: any) => {
    // Navigate to the appropriate page based on result type
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
        // Fallback for unknown types or if no specific route is needed
        break; 
    }

    // Navigate to the page
    // Using window.location.href for full page reload, consider react-router-dom's useNavigate for SPA behavior
    window.location.href = targetUrl; 
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return '🎯';
      case 'roadmap':
        return '🗺️';
      case 'roadmap-step':
        return '📚';
      case 'interview':
        return '🎤';
      case 'interview-question':
        return '❓';
      default:
        return '📄';
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'goal':
        return 'Goal';
      case 'roadmap':
        return 'Roadmap';
      case 'roadmap-step':
        return 'Learning Step';
      case 'interview':
        return 'Mock Interview';
      case 'interview-question':
        return 'Interview Question';
      default:
        return 'Result';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-lg relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals, roadmaps, interviews..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSearchResults(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    {searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <button
                          key={`${result.type}-${result.id}-${index}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">{getResultIcon(result.type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {result.title}
                                </span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                  {getResultTypeLabel(result.type)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {result.description}
                              </p>
                              {result.type === 'roadmap-step' && result.roadmapTitle && ( // Check for roadmapTitle
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  From: {result.roadmapTitle}
                                </p>
                              )}
                              {result.type === 'interview-question' && result.interviewRole && ( // Check for interviewRole
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  From: {result.interviewRole} interview
                                </p>
                              )}
                              {(result.completed !== undefined) && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
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

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <NotificationCenter />

            <div className="flex items-center space-x-3">
              {/* Profile Section with Cool Hover Animation */}
              <Link 
                to="/dashboard/profile"
                className="group flex items-center space-x-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                    {userProfile?.displayName || currentUser?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    {userProfile?.currentRole || 'Set your role'}
                  </p>
                </div>
                
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
                    {userProfile?.photoURL || currentUser?.photoURL ? (
                      <img
                        src={userProfile?.photoURL || currentUser?.photoURL || ''}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {(userProfile?.displayName || currentUser?.displayName || 'U')[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  
                  {/* Animated Ring on Hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 animate-pulse"></div>
                  
                  {/* Subtle Glow Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 blur-md transition-all duration-300"></div>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap z-50">
                  View Profile
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};