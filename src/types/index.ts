export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currentRole?: string;
  targetRole?: string;
  experience?: string;
  location?: string;
  bio?: string;
  skills: string[];
  goals: Goal[];
  roadmaps: Roadmap[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  category?: string;
  createdAt: Date;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  skill: string;
  steps: RoadmapStep[];
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  resources: Resource[];
  estimatedTime: string;
  order: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'course' | 'book' | 'practice';
  url: string;
  description?: string;
}

export interface MockInterview {
  id: string;
  role: string;
  questions: InterviewQuestion[];
  feedback?: string;
  score?: number;
  createdAt: Date;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer?: string;
  feedback?: string;
  score?: number;
}

export interface Activity {
  id: string;
  type: 'goal_completed' | 'roadmap_step' | 'interview_completed' | 'roadmap_created' | 'goal_created';
  title: string;
  description: string;
  timestamp: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}