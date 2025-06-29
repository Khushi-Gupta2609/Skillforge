// Enhanced AI Service with Gemini integration
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Roadmap, RoadmapStep, MockInterview, InterviewQuestion, Resource } from '../types';

// Initialize Gemini AI with proper error handling
let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null; // More specific type

const initializeGemini = (): boolean => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('🔑 Gemini API Key found:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');

    if (apiKey && apiKey !== 'demo-key' && apiKey.length > 10) {
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });
      console.log('✅ Gemini AI initialized successfully with gemini-1.5-flash model');
      return true;
    } else {
      console.warn('⚠️ Invalid Gemini API key, using fallback responses');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error);
    return false;
  }
};

// Initialize on module load
const isGeminiAvailable = initializeGemini();

export class GeminiService {

  /**
   * Internal helper to call Gemini API with common error handling and JSON parsing.
   * @param prompt The prompt string to send to Gemini.
   * @param logIdentifier A string to identify the API call in logs (e.g., "roadmap generation").
   * @returns A parsed JSON object from Gemini's response.
   * @throws Error if the Gemini API call fails, response is blocked, or JSON parsing fails.
   */
  private static async _callGeminiApi<T>(prompt: string, logIdentifier: string): Promise<T> {
    if (!model || !isGeminiAvailable) {
      console.warn(`📝 Gemini model not available for ${logIdentifier}. This call should ideally be guarded by a fallback.`);
      throw new Error('Gemini model not initialized or API key is invalid.'); // Force fallback logic
    }

    try {
      console.log(`🚀 Calling Gemini API for ${logIdentifier}...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (response.promptFeedback?.blockReason) {
        console.warn(`⚠️ Gemini response for ${logIdentifier} was blocked:`, response.promptFeedback.blockReason);
        throw new Error('Content was blocked by safety filters');
      }

      const text = response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }

      console.log(`📥 Gemini ${logIdentifier} response received (first 300 chars):`, text.substring(0, 300));

      let cleanText = text.trim();

      // Remove markdown code blocks if present
      const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanText = jsonMatch[1];
      }

      // Find JSON object in the response if it's not a pure JSON string
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON object found in Gemini response');
      }

      cleanText = cleanText.substring(jsonStart, jsonEnd);
      console.log(`🧹 Cleaned JSON for ${logIdentifier} (first 200 chars):`, cleanText.substring(0, 200));

      const parsedData: T = JSON.parse(cleanText);
      console.log(`✅ Successfully parsed Gemini ${logIdentifier} response`);
      return parsedData;

    } catch (error: any) {
      console.error(`❌ Error during Gemini API call for ${logIdentifier}:`, error);

      // Check for specific error types
      if (error.message?.includes('API_KEY_INVALID')) {
        console.error('🔑 Your Gemini API key is invalid. Please check your API key.');
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        console.error('📊 Your Gemini API quota has been exceeded.');
      } else if (error.message?.includes('404')) {
        console.error('🌐 Gemini API endpoint not found. This might be a temporary issue.');
      }
      throw error; // Re-throw to be caught by specific service method for fallback
    }
  }

  // Test Gemini connection
  static async testConnection(): Promise<boolean> {
    if (!model) {
      console.log('❌ Gemini model not available');
      return false;
    }
    try {
      console.log('🧪 Testing Gemini connection...');
      const response = await this._callGeminiApi<{ message: string }>('Say "Hello from Gemini!"', 'connection test');
      console.log('✅ Gemini test successful:', response.message);
      return true;
    } catch (error) {
      console.error('❌ Gemini test failed:', error);
      return false;
    }
  }

  // Generate skill learning roadmap using Gemini AI
  static async generateRoadmap(
    skill: string,
    currentLevel: 'beginner' | 'intermediate' | 'advanced',
    targetRole: string
  ): Promise<Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>> {
    console.log(`🤖 Generating roadmap for ${skill} (${currentLevel}) → ${targetRole}`);

    try {
      const prompt = `Create a comprehensive learning roadmap for ${skill} skill development.

Context:
- Current Level: ${currentLevel}
- Target Role: ${targetRole}
- Skill: ${skill}

Please provide a structured roadmap with exactly this JSON format (no additional text or markdown):

{
  "title": "Complete ${skill} Learning Path for ${targetRole}",
  "description": "Comprehensive roadmap to master ${skill} from ${currentLevel} to ${targetRole} level",
  "skill": "${skill}",
  "estimatedDuration": "8-12 weeks",
  "difficulty": "${currentLevel}",
  "steps": [
    {
      "title": "Step 1 Title",
      "description": "Detailed description of what to learn",
      "estimatedTime": "1-2 weeks",
      "resources": [
        {
          "title": "Official Documentation",
          "type": "article",
          "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
        },
        {
          "title": "Interactive Tutorial",
          "type": "course",
          "url": "https://javascript.info/"
        },
        {
          "title": "Video Course",
          "type": "video",
          "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Example placeholder
        },
        {
          "title": "Practice Exercises",
          "type": "practice",
          "url": "https://www.codewars.com/"
        }
      ]
    }
  ]
}

IMPORTANT: Provide REAL, working URLs for resources. Use actual documentation sites, popular courses, YouTube channels, and practice platforms. Each step should have 3-4 high-quality resources with different types (article, video, course, practice, book).

Provide 6-8 steps total. Make it practical and actionable. Return only valid JSON.`;

      const roadmapData = await this._callGeminiApi<{
        title: string;
        description: string;
        skill: string;
        estimatedDuration: string;
        difficulty: string;
        steps: Array<any>;
      }>(prompt, 'roadmap generation');

      if (!roadmapData.steps || !Array.isArray(roadmapData.steps)) {
        throw new Error('Invalid roadmap structure: missing steps array from Gemini');
      }

      const steps: RoadmapStep[] = roadmapData.steps.map((step: any, index: number) => ({
        id: `step-${index + 1}`,
        title: step.title || `Step ${index + 1}`,
        description: step.description || 'No description provided',
        completed: false,
        resources: (step.resources || []).map((resource: any, resourceIndex: number) => ({
          id: `resource-${resourceIndex + 1}`,
          title: resource.title || 'Resource',
          type: resource.type || 'article',
          url: resource.url || '#'
        })),
        estimatedTime: step.estimatedTime || '1 week',
        order: index + 1
      }));

      const result_roadmap = {
        title: roadmapData.title || `${skill} Learning Path`,
        description: roadmapData.description || `Learn ${skill} effectively`,
        skill: roadmapData.skill || skill,
        steps,
        estimatedDuration: roadmapData.estimatedDuration || '8 weeks',
        difficulty: roadmapData.difficulty as 'beginner' | 'intermediate' | 'advanced'
      };

      console.log('🎉 Gemini roadmap generated successfully with', steps.length, 'steps');
      return result_roadmap;

    } catch (error) {
      console.error('📝 Falling back to template roadmap due to Gemini error.');
      return this.generateFallbackRoadmap(skill, currentLevel, targetRole);
    }
  }

  // Generate mock interview questions using Gemini AI
  static async generateMockInterview(
    role: string,
    experience: string
  ): Promise<Omit<MockInterview, 'id' | 'createdAt'>> {
    console.log(`🎤 Generating mock interview for ${role} (${experience})`);

    try {
      const prompt = `Generate 5 realistic interview questions for a ${role} position with ${experience} experience level.

Requirements:
- Questions should be appropriate for the experience level
- Mix of technical and behavioral questions
- Include follow-up scenarios where relevant
- Questions should be realistic and commonly asked

Respond with exactly this JSON format (no additional text or markdown):

{
  "role": "${role}",
  "questions": [
    {
      "question": "Tell me about yourself and your experience with [relevant technology]."
    }
  ]
}

Return only valid JSON.`;

      const interviewData = await this._callGeminiApi<{ role: string; questions: Array<any> }>(prompt, 'interview generation');

      const questions: InterviewQuestion[] = (interviewData.questions || []).map((q: any, index: number) => ({
        id: `question-${index + 1}`,
        question: q.question || `Question ${index + 1}`
      }));

      console.log('🎉 Gemini interview generated successfully with', questions.length, 'questions');
      return {
        role: interviewData.role || role,
        questions
      };
    } catch (error) {
      console.error('📝 Falling back to template interview due to Gemini error.');
      return this.generateFallbackInterview(role, experience);
    }
  }

  // Evaluate interview answers using Gemini AI with enhanced error handling
  static async evaluateInterview(
    questions: InterviewQuestion[]
  ): Promise<{ feedback: string; score: number }> {
    console.log('🔍 Evaluating interview answers...');

    const answeredQuestions = questions.filter(q => q.answer && q.answer.trim().length > 0);

    if (answeredQuestions.length === 0) {
      return {
        feedback: "No answers provided. Please answer the questions to receive feedback.",
        score: 0
      };
    }

    // Currently always using fallback evaluation for reliability as per original code's comment
    console.log('📝 Using enhanced fallback evaluation for reliability');
    return this.generateEnhancedFallbackEvaluation(questions);

    /* Original Gemini evaluation logic (commented out as per user's original code)
    if (!model || !isGeminiAvailable) {
      console.log('📝 Gemini not available, using fallback evaluation');
      return this.generateEnhancedFallbackEvaluation(questions);
    }

    try {
      const prompt = `Evaluate these interview answers and provide detailed feedback:

${answeredQuestions.map((q, i) => `
Question ${i + 1}: ${q.question}
Answer: ${q.answer}
`).join('\n')}

Please provide a comprehensive evaluation with exactly this JSON format (no additional text or markdown):

{
  "score": 75,
  "feedback": "Overall Performance: 75/100\\n\\nStrengths:\\n- Good communication skills\\n- Clear examples provided\\n\\nAreas for Improvement:\\n- More technical depth needed\\n- Provide specific metrics\\n\\nRecommendations:\\n- Practice explaining complex concepts simply\\n- Prepare more detailed project examples"
}

Score should be 0-100. Feedback should be detailed and constructive. Return only valid JSON.`;

      const evaluation = await this._callGeminiApi<{ score: number; feedback: string }>(prompt, 'interview evaluation');

      const result_eval = {
        score: Math.min(100, Math.max(0, evaluation.score || 50)),
        feedback: evaluation.feedback || 'Evaluation completed successfully.'
      };

      console.log('🎉 Gemini evaluation completed with score:', result_eval.score);
      return result_eval;
    } catch (error) {
      console.error('📝 Falling back to enhanced evaluation due to Gemini error.');
      return this.generateEnhancedFallbackEvaluation(questions);
    }
    */
  }

  // Generate skill assessment questions
  static async generateSkillAssessment(skill: string): Promise<any[]> {
    console.log(`📚 Generating skill assessment for ${skill}`);

    try {
      const prompt = `Generate 5 technical assessment questions for ${skill}.

Requirements:
- Multiple choice questions with 4 options each
- Progressive difficulty from basic to intermediate
- Include explanations for correct answers
- Cover fundamental to intermediate concepts

Respond with exactly this JSON format (no additional text or markdown):

{
  "questions": [
    {
      "question": "What is the primary purpose of ${skill}?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct"
    }
  ]
}

Return only valid JSON.`;

      const assessmentData = await this._callGeminiApi<{ questions: Array<any> }>(prompt, 'skill assessment');
      console.log('🎉 Gemini assessment generated successfully with', assessmentData.questions?.length || 0, 'questions');
      return assessmentData.questions || this.generateFallbackAssessment(skill);
    } catch (error) {
      console.error('📝 Falling back to template assessment due to Gemini error.');
      return this.generateFallbackAssessment(skill);
    }
  }

  // --- Fallback Methods (Simplified to be less "AI-like" and more template-based) ---

  private static generateEnhancedFallbackEvaluation(questions: InterviewQuestion[]) {
    // This method remains as-is, as it's the current explicit fallback
    // and implements a specific scoring heuristic.
    console.log('📝 Generating enhanced fallback evaluation');

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
    const strengths: string[] = [];
    const improvements: string[] = [];

    answeredQuestions.forEach((question, index) => {
      const answer = question.answer || '';
      const answerLength = answer.length;
      const wordCount = answer.split(/\s+/).filter(word => word.length > 0).length;

      let questionScore = 0;
      let feedback = '';

      // Enhanced scoring based on multiple factors
      if (wordCount >= 50 && answerLength > 300) {
        questionScore = 85 + Math.random() * 15;
        feedback = 'Comprehensive and detailed answer with good depth.';
        strengths.push('Provides thorough explanations');
      } else if (wordCount >= 30 && answerLength > 200) {
        questionScore = 75 + Math.random() * 10;
        feedback = 'Good answer with adequate detail.';
        strengths.push('Clear communication');
      } else if (wordCount >= 20 && answerLength > 100) {
        questionScore = 65 + Math.random() * 10;
        feedback = 'Basic answer, could benefit from more examples.';
        improvements.push('Provide more specific examples');
      } else if (wordCount >= 10 && answerLength > 50) {
        questionScore = 50 + Math.random() * 15;
        feedback = 'Brief answer, needs more elaboration.';
        improvements.push('Expand on key points');
      } else {
        questionScore = 30 + Math.random() * 20;
        feedback = 'Very brief answer, requires significant expansion.';
        improvements.push('Provide much more detail');
      }

      // Bonus points for technical keywords (simple heuristic)
      const technicalKeywords = ['implement', 'design', 'architecture', 'performance', 'optimize', 'debug', 'test', 'framework', 'database', 'API', 'security', 'scalability'];
      const keywordMatches = technicalKeywords.filter(keyword =>
        answer.toLowerCase().includes(keyword)
      ).length;

      if (keywordMatches > 0) {
        questionScore += Math.min(keywordMatches * 2, 10);
        strengths.push('Uses relevant technical terminology');
      }

      feedbackPoints.push(`Question ${index + 1}: ${feedback}`);
      totalScore += questionScore;
    });

    const averageScore = Math.round(totalScore / answeredQuestions.length);
    const completionRate = Math.round((answeredQuestions.length / totalQuestions) * 100);

    // Generate comprehensive feedback
    let overallFeedback = `🎯 Interview Performance Report\n\n`;
    overallFeedback += `📊 Overall Score: ${averageScore}/100\n`;
    overallFeedback += `✅ Completion Rate: ${completionRate}%\n`;
    overallFeedback += `📝 Questions Answered: ${answeredQuestions.length}/${totalQuestions}\n\n`;

    // Strengths section
    if (strengths.length > 0) {
      overallFeedback += `💪 Strengths:\n`;
      const uniqueStrengths = [...new Set(strengths)];
      uniqueStrengths.forEach(strength => {
        overallFeedback += `• ${strength}\n`;
      });
      overallFeedback += '\n';
    }

    // Areas for improvement
    if (improvements.length > 0) {
      overallFeedback += `🎯 Areas for Improvement:\n`;
      const uniqueImprovements = [...new Set(improvements)];
      uniqueImprovements.forEach(improvement => {
        overallFeedback += `• ${improvement}\n`;
      });
      overallFeedback += '\n';
    }

    // Detailed question feedback
    overallFeedback += `📋 Question-by-Question Feedback:\n`;
    feedbackPoints.forEach(point => {
      overallFeedback += `${point}\n`;
    });
    overallFeedback += '\n';

    // Performance-based recommendations
    if (averageScore >= 85) {
      overallFeedback += `🌟 Excellent Performance!\n`;
      overallFeedback += `You demonstrated strong knowledge and excellent communication skills. You're well-prepared for interviews at this level.\n\n`;
      overallFeedback += `🚀 Next Steps:\n`;
      overallFeedback += `• Consider applying for senior-level positions\n`;
      overallFeedback += `• Practice system design questions\n`;
      overallFeedback += `• Prepare leadership and mentoring examples\n`;
    } else if (averageScore >= 70) {
      overallFeedback += `👍 Good Performance!\n`;
      overallFeedback += `You have a solid foundation and good communication skills. With some refinement, you'll be ready for most interviews.\n\n`;
      overallFeedback += `📈 Recommendations:\n`;
      overallFeedback += `• Practice providing more detailed technical examples\n`;
      overallFeedback += `• Prepare specific metrics and outcomes from your projects\n`;
      overallFeedback += `• Work on explaining complex concepts simply\n`;
    } else if (averageScore >= 55) {
      overallFeedback += `📚 Room for Improvement\n`;
      overallFeedback += `You have the basic knowledge but need to work on articulating your thoughts more clearly and providing more depth.\n\n`;
      overallFeedback += `🎯 Focus Areas:\n`;
      overallFeedback += `• Practice the STAR method (Situation, Task, Action, Result)\n`;
      overallFeedback += `• Prepare detailed examples from your experience\n`;
      overallFeedback += `• Study common interview questions for your role\n`;
    } else {
      overallFeedback += `🌱 Keep Learning!\n`;
      overallFeedback += `This is a great start! Focus on building your knowledge and practicing your communication skills.\n\n`;
      overallFeedback += `📖 Study Plan:\n`;
      overallFeedback += `• Review fundamental concepts for your target role\n`;
      overallFeedback += `• Practice explaining technical concepts out loud\n`;
      overallFeedback += `• Take more mock interviews to build confidence\n`;
    }

    return {
      feedback: overallFeedback,
      score: averageScore
    };
  }

  private static generateFallbackRoadmap(skill: string, currentLevel: string, targetRole: string): Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'> {
    console.log('📝 Generating simplified fallback roadmap');

    // A very generic fallback to ensure *some* data is returned
    const genericSteps: RoadmapStep[] = [
      {
        id: 'fallback-step-1',
        title: `Learn ${skill} Fundamentals`,
        description: `Start with the core concepts and syntax of ${skill}.`,
        completed: false,
        resources: [
          { id: 'fallback-res-1', title: `${skill} Official Docs`, type: 'article', url: `https://example.com/${skill.toLowerCase()}-docs` },
          { id: 'fallback-res-2', title: `Beginner ${skill} Course`, type: 'course', url: `https://example.com/beginner-${skill.toLowerCase()}-course` },
        ],
        estimatedTime: '2 weeks',
        order: 1
      },
      {
        id: 'fallback-step-2',
        title: `Build a Small ${skill} Project`,
        description: `Apply your knowledge by building a simple project related to ${skill}.`,
        completed: false,
        resources: [
          { id: 'fallback-res-3', title: `Project Ideas for ${skill}`, type: 'article', url: `https://example.com/${skill.toLowerCase()}-projects` },
          { id: 'fallback-res-4', title: `Project Tutorial for ${skill}`, type: 'video', url: `https://www.youtube.com/watch?v=fallback` },
        ],
        estimatedTime: '3 weeks',
        order: 2
      }
    ];

    return {
      title: `${skill} Learning Path (Fallback)`,
      description: `A basic learning path for ${skill} for a ${currentLevel} aiming for a ${targetRole} role.`,
      skill,
      steps: genericSteps,
      estimatedDuration: '5-7 weeks',
      difficulty: currentLevel as 'beginner' | 'intermediate' | 'advanced'
    };
  }

  private static generateFallbackInterview(role: string, experience: string): Omit<MockInterview, 'id' | 'createdAt'> {
    console.log('📝 Generating simplified fallback interview');

    const genericQuestions: InterviewQuestion[] = [
      { id: 'fb-q-1', question: `Tell me about your experience as a ${role}.` },
      { id: 'fb-q-2', question: `Describe a challenging problem you've solved recently in a ${role} context.` },
      { id: 'fb-q-3', question: `How do you stay updated with the latest trends in ${role} development?` },
      { id: 'fb-q-4', question: `What are your strengths and weaknesses as a ${role}?` },
      { id: 'fb-q-5', question: `Do you have any questions for us about the ${role} position?` },
    ];

    return {
      role,
      questions: genericQuestions
    };
  }

  private static generateFallbackAssessment(skill: string): any[] {
    console.log('📝 Generating simplified fallback assessment');

    const genericAssessmentQuestions = [
      {
        question: `What is a fundamental concept in ${skill}?`,
        options: [`Concept A`, `Concept B`, `Concept C`, `Concept D`],
        correctAnswer: 0,
        explanation: `Concept A is a core building block of ${skill}.`
      },
      {
        question: `Which tool is commonly used with ${skill}?`,
        options: [`Tool X`, `Tool Y`, `Tool Z`, `None of the above`],
        correctAnswer: 1,
        explanation: `Tool Y is widely adopted in the ${skill} ecosystem.`
      }
    ];

    return genericAssessmentQuestions;
  }
}