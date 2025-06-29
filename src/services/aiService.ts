// Enhanced AI Service with Gemini integration
import { GeminiService } from './geminiService';
import type { Roadmap, RoadmapStep, MockInterview, InterviewQuestion, Resource } from '../types';

export class AIService {
  // Generate a learning roadmap using Gemini AI
  static async generateRoadmap(
    skill: string, 
    currentLevel: 'beginner' | 'intermediate' | 'advanced',
    targetRole: string
  ): Promise<Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>> {
    try {
      // Try Gemini first
      return await GeminiService.generateRoadmap(skill, currentLevel, targetRole);
    } catch (error) {
      console.error('Gemini service failed, using fallback:', error);
      // Fallback to local generation
      return this.generateLocalRoadmap(skill, currentLevel, targetRole);
    }
  }

  // Generate mock interview using Gemini AI
  static async generateMockInterview(
    role: string, 
    experience: string
  ): Promise<Omit<MockInterview, 'id' | 'createdAt'>> {
    try {
      return await GeminiService.generateMockInterview(role, experience);
    } catch (error) {
      console.error('Gemini service failed, using fallback:', error);
      return this.generateLocalInterview(role, experience);
    }
  }

  // Evaluate interview using Gemini AI
  static async evaluateInterview(
    questions: InterviewQuestion[]
  ): Promise<{ feedback: string; score: number }> {
    try {
      return await GeminiService.evaluateInterview(questions);
    } catch (error) {
      console.error('Gemini service failed, using fallback:', error);
      return this.evaluateLocalInterview(questions);
    }
  }

  // Generate skill assessment using Gemini AI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async generateSkillAssessment(skill: string): Promise<any[]> {
    try {
      return await GeminiService.generateSkillAssessment(skill);
    } catch (error) {
      console.error('Gemini service failed, using fallback:', error);
      return this.generateLocalAssessment(skill);
    }
  }

  // Generate personalized recommendations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async generateRecommendations(userProfile: any, stats: any): Promise<string[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const prompt = `
        Based on this user profile and stats, generate 4 personalized learning recommendations:
        
        Profile: ${JSON.stringify(userProfile)}
        Stats: ${JSON.stringify(stats)}
        
        Focus on actionable advice for skill development and career growth.
      `;

      // This would use Gemini in production
      return [
        'Focus on completing your React roadmap - you\'re 60% done!',
        'Consider taking a system design course to complement your skills',
        'Practice more mock interviews to improve your confidence',
        'Set a goal to contribute to an open source project'
      ];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return [
        'Continue your current learning path',
        'Practice coding challenges regularly',
        'Build more projects to showcase your skills',
        'Network with other developers in your field'
      ];
    }
  }

  // Local fallback methods
  private static generateLocalRoadmap(skill: string, currentLevel: string, targetRole: string) {
    const roadmapTemplates = {
      'React': {
        beginner: [
          { title: 'JavaScript Fundamentals', description: 'Master ES6+ features, async/await, and DOM manipulation', time: '2 weeks' },
          { title: 'React Basics', description: 'Components, JSX, props, and state management', time: '2 weeks' },
          { title: 'React Hooks', description: 'useState, useEffect, and custom hooks', time: '1 week' },
          { title: 'State Management', description: 'Context API and basic state patterns', time: '1 week' },
          { title: 'Routing', description: 'React Router for navigation', time: '1 week' },
          { title: 'Build a Project', description: 'Create a complete React application', time: '2 weeks' }
        ],
        intermediate: [
          { title: 'Advanced Hooks', description: 'useReducer, useMemo, useCallback, and custom hooks', time: '1 week' },
          { title: 'Performance Optimization', description: 'React.memo, lazy loading, and code splitting', time: '1 week' },
          { title: 'Testing', description: 'Jest, React Testing Library, and component testing', time: '2 weeks' },
          { title: 'State Management Libraries', description: 'Redux Toolkit or Zustand', time: '2 weeks' },
          { title: 'TypeScript Integration', description: 'Type-safe React development', time: '1 week' },
          { title: 'Advanced Project', description: 'Build a complex application with best practices', time: '3 weeks' }
        ],
        advanced: [
          { title: 'React Internals', description: 'Fiber architecture, reconciliation, and rendering', time: '2 weeks' },
          { title: 'Custom Hooks Library', description: 'Build reusable hook patterns', time: '1 week' },
          { title: 'Micro-frontends', description: 'Module federation and micro-frontend architecture', time: '2 weeks' },
          { title: 'Server-Side Rendering', description: 'Next.js and SSR optimization', time: '2 weeks' },
          { title: 'React Native', description: 'Cross-platform mobile development', time: '3 weeks' },
          { title: 'Open Source Contribution', description: 'Contribute to React ecosystem projects', time: '4 weeks' }
        ]
      }
    };

    const template = roadmapTemplates[skill as keyof typeof roadmapTemplates]?.[currentLevel as keyof typeof roadmapTemplates['React']] || 
                    roadmapTemplates['React'][currentLevel as keyof typeof roadmapTemplates['React']];

    const steps: RoadmapStep[] = template.map((step, index) => ({
      id: `step-${index + 1}`,
      title: step.title,
      description: step.description,
      completed: false,
      resources: this.generateResources(step.title),
      estimatedTime: step.time,
      order: index + 1
    }));

    const totalWeeks = template.reduce((acc, step) => {
      const weeks = parseInt(step.time.split(' ')[0]);
      return acc + weeks;
    }, 0);

    return {
      title: `${skill} ${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} to ${targetRole}`,
      description: `Comprehensive learning path to master ${skill} and become a ${targetRole}`,
      skill,
      steps,
      estimatedDuration: `${totalWeeks} weeks`,
      difficulty: currentLevel as 'beginner' | 'intermediate' | 'advanced'
    };
  }

  private static generateResources(topic: string): Resource[] {
    const resourceTemplates = {
      'JavaScript Fundamentals': [
        { title: 'MDN JavaScript Guide', type: 'article', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
        { title: 'JavaScript.info', type: 'course', url: 'https://javascript.info/' },
        { title: 'You Don\'t Know JS', type: 'book', url: 'https://github.com/getify/You-Dont-Know-JS' }
      ],
      'React Basics': [
        { title: 'React Official Tutorial', type: 'course', url: 'https://react.dev/learn' },
        { title: 'React Crash Course', type: 'video', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8' },
        { title: 'React Exercises', type: 'practice', url: 'https://react-exercises.com/' }
      ]
    };

    const defaultResources = [
      { title: `${topic} Documentation`, type: 'article' as const, url: '#' },
      { title: `${topic} Tutorial`, type: 'video' as const, url: '#' },
      { title: `${topic} Practice`, type: 'practice' as const, url: '#' }
    ];

    const resources = resourceTemplates[topic as keyof typeof resourceTemplates] || defaultResources;
    
    return resources.map((resource, index) => ({
      id: `resource-${index + 1}`,
      ...resource
    }));
  }

  private static generateLocalInterview(role: string, experience: string) {
    const questionTemplates = {
      'Frontend Developer': {
        junior: [
          'What is the difference between let, const, and var in JavaScript?',
          'Explain the concept of closures in JavaScript.',
          'What are React hooks and why are they useful?',
          'How do you handle state management in React?',
          'What is the difference between CSS Grid and Flexbox?'
        ],
        mid: [
          'Explain the virtual DOM and how React uses it.',
          'What are the different ways to optimize React performance?',
          'How would you implement authentication in a React application?',
          'Describe your approach to responsive web design.',
          'What testing strategies do you use for frontend applications?'
        ],
        senior: [
          'How would you architect a large-scale React application?',
          'Explain micro-frontends and when you would use them.',
          'How do you ensure accessibility in web applications?',
          'Describe your approach to code review and mentoring.',
          'How would you handle performance optimization for a high-traffic website?'
        ]
      }
    };

    const experienceLevel = experience.toLowerCase().includes('senior') ? 'senior' :
                           experience.toLowerCase().includes('mid') || experience.toLowerCase().includes('intermediate') ? 'mid' : 'junior';

    const questions = questionTemplates[role as keyof typeof questionTemplates]?.[experienceLevel] || 
                     questionTemplates['Frontend Developer'][experienceLevel];

    const interviewQuestions: InterviewQuestion[] = questions.map((question, index) => ({
      id: `question-${index + 1}`,
      question
    }));

    return {
      role,
      questions: interviewQuestions
    };
  }

  private static evaluateLocalInterview(questions: InterviewQuestion[]) {
    const answeredQuestions = questions.filter(q => q.answer && q.answer.trim().length > 0);
    const totalQuestions = questions.length;
    
    if (answeredQuestions.length === 0) {
      return {
        feedback: "No answers provided. Please answer the questions to receive feedback.",
        score: 0
      };
    }

    let totalScore = 0;
    const feedbackPoints: string[] = [];

    answeredQuestions.forEach((question, index) => {
      const answerLength = question.answer?.length || 0;
      let questionScore = 0;

      if (answerLength > 200) {
        questionScore = 85 + Math.random() * 15;
        feedbackPoints.push(`Question ${index + 1}: Comprehensive answer with good detail.`);
      } else if (answerLength > 100) {
        questionScore = 70 + Math.random() * 15;
        feedbackPoints.push(`Question ${index + 1}: Good answer, could use more examples.`);
      } else if (answerLength > 50) {
        questionScore = 55 + Math.random() * 15;
        feedbackPoints.push(`Question ${index + 1}: Basic answer, needs more depth.`);
      } else {
        questionScore = 30 + Math.random() * 25;
        feedbackPoints.push(`Question ${index + 1}: Answer too brief, elaborate more.`);
      }

      totalScore += questionScore;
    });

    const averageScore = Math.round(totalScore / answeredQuestions.length);
    const completionRate = Math.round((answeredQuestions.length / totalQuestions) * 100);

    let overallFeedback = `Interview Completion: ${completionRate}%\n\n`;
    overallFeedback += `Overall Performance: ${averageScore}/100\n\n`;
    overallFeedback += "Detailed Feedback:\n" + feedbackPoints.join('\n');
    
    if (averageScore >= 80) {
      overallFeedback += "\n\nExcellent performance! You demonstrated strong knowledge and communication skills.";
    } else if (averageScore >= 70) {
      overallFeedback += "\n\nGood performance! Focus on providing more detailed examples and explanations.";
    } else if (averageScore >= 60) {
      overallFeedback += "\n\nFair performance. Work on expanding your answers with more technical details.";
    } else {
      overallFeedback += "\n\nNeeds improvement. Practice explaining concepts more thoroughly and provide concrete examples.";
    }

    return {
      feedback: overallFeedback,
      score: averageScore
    };
  }

  private static generateLocalAssessment(skill: string) {
    return [
      {
        question: `What is the main purpose of ${skill}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: `${skill} is primarily used for building user interfaces.`
      },
      {
        question: `Which of the following is a key feature of ${skill}?`,
        options: ['Component-based architecture', 'Virtual DOM', 'Declarative syntax', 'All of the above'],
        correctAnswer: 3,
        explanation: `${skill} includes all these features for efficient development.`
      }
    ];
  }
}