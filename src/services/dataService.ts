import { 
  ref, 
  push, 
  set, 
  get, 
  update, 
  remove,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  onValue,
  off
} from 'firebase/database';
import { database, isFirebaseReady } from './firebase';
import type { Goal, Roadmap, RoadmapStep, MockInterview, UserProfile } from '../types';

// Enhanced localStorage service with better error handling
class LocalStorageService {
  private static getKey(uid: string, collection: string): string {
    return `skillforge_${uid}_${collection}`;
  }

  static saveData<T>(uid: string, collection: string, data: T[]): void {
    try {
      const serialized = JSON.stringify(data, (key, value) => {
        // Handle Date objects
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      });
      localStorage.setItem(this.getKey(uid, collection), serialized);
      console.log(`💾 Saved ${collection} to localStorage:`, data.length, 'items');
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      // Try to clear some space and retry
      try {
        this.clearOldData();
        localStorage.setItem(this.getKey(uid, collection), serialized);
        console.log('✅ Retry successful after clearing old data');
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
      }
    }
  }

  static loadData<T>(uid: string, collection: string): T[] {
    try {
      const stored = localStorage.getItem(this.getKey(uid, collection));
      if (!stored) return [];
      
      const data = JSON.parse(stored, (key, value) => {
        // Handle Date objects
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      });
      
      console.log(`📂 Loaded ${collection} from localStorage:`, data.length, 'items');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      return [];
    }
  }

  static addItem<T extends { id: string }>(uid: string, collection: string, item: T): void {
    const data = this.loadData<T>(uid, collection);
    data.unshift(item);
    this.saveData(uid, collection, data);
    console.log(`➕ Added item to ${collection}:`, item.id);
  }

  static updateItem<T extends { id: string }>(uid: string, collection: string, id: string, updates: Partial<T>): void {
    const data = this.loadData<T>(uid, collection);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      this.saveData(uid, collection, data);
      console.log(`✏️ Updated item in ${collection}:`, id);
    }
  }

  static deleteItem<T extends { id: string }>(uid: string, collection: string, id: string): void {
    const data = this.loadData<T>(uid, collection);
    const filtered = data.filter(item => item.id !== id);
    this.saveData(uid, collection, filtered);
    console.log(`🗑️ Deleted item from ${collection}:`, id);
  }

  // Clear old data to free up space
  private static clearOldData(): void {
    const keys = Object.keys(localStorage);
    const skillforgeKeys = keys.filter(key => key.startsWith('skillforge_'));
    
    // Sort by last modified (if available) and remove oldest
    skillforgeKeys.sort().slice(0, Math.floor(skillforgeKeys.length / 2)).forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🧹 Cleared old localStorage data');
  }
}

export class DataService {
  // Helper method to generate IDs
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper method to convert Firebase data to array
  private static convertFirebaseDataToArray<T>(data: any): T[] {
    if (!data) return [];
    
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key],
      // Convert ISO strings back to Date objects
      createdAt: data[key].createdAt ? new Date(data[key].createdAt) : new Date(),
      updatedAt: data[key].updatedAt ? new Date(data[key].updatedAt) : new Date(),
      targetDate: data[key].targetDate ? new Date(data[key].targetDate) : undefined
    })).sort((a: any, b: any) => {
      // Sort by createdAt descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // User Profile Operations
  static async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        console.log('🎮 Demo mode: Updating user profile in localStorage');
        const stored = localStorage.getItem(`skillforge-user-profile-${uid}`);
        if (stored) {
          const profile = JSON.parse(stored);
          const updated = { ...profile, ...data, updatedAt: new Date() };
          localStorage.setItem(`skillforge-user-profile-${uid}`, JSON.stringify(updated));
          console.log('✅ Profile updated in localStorage');
        }
        return;
      }

      console.log('📝 Firebase: Updating user profile');
      const userRef = ref(database, `users/${uid}`);
      await update(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Firebase: User profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  // Goals Operations
  static async createGoal(uid: string, goal: Omit<Goal, 'id' | 'createdAt'>) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const goalWithId: Goal = {
          ...goal,
          id: this.generateId(),
          createdAt: new Date()
        };
        
        console.log('🎮 Demo mode: Creating goal in localStorage');
        LocalStorageService.addItem(uid, 'goals', goalWithId);
        
        await this.logActivity(uid, {
          type: 'goal_created',
          title: 'New Goal Created',
          description: `Created goal: ${goal.title}`,
          metadata: { goalId: goalWithId.id }
        });
        
        console.log('✅ Goal created in localStorage:', goalWithId.title);
        return goalWithId.id;
      }

      console.log('📝 Firebase: Creating goal');
      const goalsRef = ref(database, `users/${uid}/goals`);
      const newGoalRef = push(goalsRef);
      
      await set(newGoalRef, {
        ...goal,
        targetDate: goal.targetDate.toISOString(),
        createdAt: new Date().toISOString()
      });

      const goalId = newGoalRef.key!;
      
      await this.logActivity(uid, {
        type: 'goal_created',
        title: 'New Goal Created',
        description: `Created goal: ${goal.title}`,
        metadata: { goalId }
      });

      console.log('✅ Firebase: Goal created successfully with ID:', goalId);
      return goalId;
    } catch (error) {
      console.error('❌ Error creating goal:', error);
      throw error;
    }
  }

  static async getUserGoals(uid: string): Promise<Goal[]> {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const goals = LocalStorageService.loadData<Goal>(uid, 'goals');
        return goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      console.log('📂 Firebase: Loading user goals');
      const goalsRef = ref(database, `users/${uid}/goals`);
      const snapshot = await get(goalsRef);
      
      if (snapshot.exists()) {
        const goals = this.convertFirebaseDataToArray<Goal>(snapshot.val());
        console.log('✅ Firebase: Goals loaded:', goals.length);
        return goals;
      }
      
      console.log('📂 Firebase: No goals found');
      return [];
    } catch (error) {
      console.error('❌ Error fetching goals:', error);
      return [];
    }
  }

  static async updateGoal(uid: string, goalId: string, data: Partial<Goal>) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        LocalStorageService.updateItem(uid, 'goals', goalId, data);
        
        if (data.completed === true) {
          const goals = LocalStorageService.loadData<Goal>(uid, 'goals');
          const goal = goals.find(g => g.id === goalId);
          if (goal) {
            await this.logActivity(uid, {
              type: 'goal_completed',
              title: 'Goal Completed',
              description: `Completed goal: ${goal.title}`,
              metadata: { goalId }
            });
          }
        }
        console.log('✅ Goal updated in localStorage');
        return;
      }

      console.log('✏️ Firebase: Updating goal');
      const goalRef = ref(database, `users/${uid}/goals/${goalId}`);
      
      // Convert Date objects to ISO strings for Firebase
      const updateData: any = { ...data };
      if (updateData.targetDate instanceof Date) {
        updateData.targetDate = updateData.targetDate.toISOString();
      }
      
      await update(goalRef, updateData);

      if (data.completed === true) {
        const goalSnapshot = await get(goalRef);
        const goalData = goalSnapshot.val();
        
        await this.logActivity(uid, {
          type: 'goal_completed',
          title: 'Goal Completed',
          description: `Completed goal: ${goalData?.title}`,
          metadata: { goalId }
        });
      }
      
      console.log('✅ Firebase: Goal updated successfully');
    } catch (error) {
      console.error('❌ Error updating goal:', error);
      throw error;
    }
  }

  static async deleteGoal(uid: string, goalId: string) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        LocalStorageService.deleteItem(uid, 'goals', goalId);
        console.log('✅ Goal deleted from localStorage');
        return;
      }

      console.log('🗑️ Firebase: Deleting goal');
      const goalRef = ref(database, `users/${uid}/goals/${goalId}`);
      await remove(goalRef);
      console.log('✅ Firebase: Goal deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
      throw error;
    }
  }

  // Roadmaps Operations
  static async createRoadmap(uid: string, roadmap: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const roadmapWithId: Roadmap = {
          ...roadmap,
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('🎮 Demo mode: Creating roadmap in localStorage');
        LocalStorageService.addItem(uid, 'roadmaps', roadmapWithId);
        
        await this.logActivity(uid, {
          type: 'roadmap_created',
          title: 'New Roadmap Created',
          description: `Created roadmap: ${roadmap.title}`,
          metadata: { roadmapId: roadmapWithId.id }
        });
        
        console.log('✅ Roadmap created in localStorage:', roadmapWithId.title);
        return roadmapWithId.id;
      }

      console.log('📝 Firebase: Creating roadmap');
      const roadmapsRef = ref(database, `users/${uid}/roadmaps`);
      const newRoadmapRef = push(roadmapsRef);
      
      await set(newRoadmapRef, {
        ...roadmap,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const roadmapId = newRoadmapRef.key!;
      
      await this.logActivity(uid, {
        type: 'roadmap_created',
        title: 'New Roadmap Created',
        description: `Created roadmap: ${roadmap.title}`,
        metadata: { roadmapId }
      });

      console.log('✅ Firebase: Roadmap created successfully with ID:', roadmapId);
      return roadmapId;
    } catch (error) {
      console.error('❌ Error creating roadmap:', error);
      throw error;
    }
  }

  static async getUserRoadmaps(uid: string): Promise<Roadmap[]> {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const roadmaps = LocalStorageService.loadData<Roadmap>(uid, 'roadmaps');
        return roadmaps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      console.log('📂 Firebase: Loading user roadmaps');
      const roadmapsRef = ref(database, `users/${uid}/roadmaps`);
      const snapshot = await get(roadmapsRef);
      
      if (snapshot.exists()) {
        const roadmaps = this.convertFirebaseDataToArray<Roadmap>(snapshot.val());
        console.log('✅ Firebase: Roadmaps loaded:', roadmaps.length);
        return roadmaps;
      }
      
      console.log('📂 Firebase: No roadmaps found');
      return [];
    } catch (error) {
      console.error('❌ Error fetching roadmaps:', error);
      return [];
    }
  }

  static async updateRoadmapStep(uid: string, roadmapId: string, stepId: string, completed: boolean) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const roadmaps = LocalStorageService.loadData<Roadmap>(uid, 'roadmaps');
        const roadmapIndex = roadmaps.findIndex(r => r.id === roadmapId);
        if (roadmapIndex !== -1) {
          const roadmap = roadmaps[roadmapIndex];
          const updatedSteps = roadmap.steps.map(step => 
            step.id === stepId ? { ...step, completed } : step
          );
          roadmaps[roadmapIndex] = { ...roadmap, steps: updatedSteps, updatedAt: new Date() };
          LocalStorageService.saveData(uid, 'roadmaps', roadmaps);
          
          if (completed) {
            const step = roadmap.steps.find(s => s.id === stepId);
            await this.logActivity(uid, {
              type: 'roadmap_step',
              title: 'Roadmap Step Completed',
              description: `Completed: ${step?.title}`,
              metadata: { roadmapId, stepId }
            });
          }
        }
        console.log('✅ Roadmap step updated in localStorage');
        return;
      }

      console.log('✏️ Firebase: Updating roadmap step');
      const roadmapRef = ref(database, `users/${uid}/roadmaps/${roadmapId}`);
      const snapshot = await get(roadmapRef);
      
      if (snapshot.exists()) {
        const roadmapData = snapshot.val() as Roadmap;
        const updatedSteps = roadmapData.steps.map(step => 
          step.id === stepId ? { ...step, completed } : step
        );
        
        await update(roadmapRef, {
          steps: updatedSteps,
          updatedAt: new Date().toISOString()
        });

        if (completed) {
          const step = roadmapData.steps.find(s => s.id === stepId);
          await this.logActivity(uid, {
            type: 'roadmap_step',
            title: 'Roadmap Step Completed',
            description: `Completed: ${step?.title}`,
            metadata: { roadmapId, stepId }
          });
        }
      }
      
      console.log('✅ Firebase: Roadmap step updated successfully');
    } catch (error) {
      console.error('❌ Error updating roadmap step:', error);
      throw error;
    }
  }

  // NEW: Delete roadmap
  static async deleteRoadmap(uid: string, roadmapId: string) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        LocalStorageService.deleteItem(uid, 'roadmaps', roadmapId);
        console.log('✅ Roadmap deleted from localStorage');
        return;
      }

      console.log('🗑️ Firebase: Deleting roadmap');
      const roadmapRef = ref(database, `users/${uid}/roadmaps/${roadmapId}`);
      await remove(roadmapRef);
      console.log('✅ Firebase: Roadmap deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting roadmap:', error);
      throw error;
    }
  }

  // Mock Interview Operations
  static async saveMockInterview(uid: string, interview: Omit<MockInterview, 'id' | 'createdAt'>) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const interviewWithId: MockInterview = {
          ...interview,
          id: this.generateId(),
          createdAt: new Date()
        };
        
        console.log('🎮 Demo mode: Saving interview in localStorage');
        LocalStorageService.addItem(uid, 'interviews', interviewWithId);
        
        await this.logActivity(uid, {
          type: 'interview_completed',
          title: 'Mock Interview Completed',
          description: `Completed ${interview.role} interview - Score: ${interview.score}/100`,
          metadata: { interviewId: interviewWithId.id, score: interview.score }
        });
        
        console.log('✅ Interview saved in localStorage:', interview.role, interview.score);
        return interviewWithId.id;
      }

      console.log('📝 Firebase: Saving interview');
      const interviewsRef = ref(database, `users/${uid}/interviews`);
      const newInterviewRef = push(interviewsRef);
      
      await set(newInterviewRef, {
        ...interview,
        createdAt: new Date().toISOString()
      });

      const interviewId = newInterviewRef.key!;
      
      await this.logActivity(uid, {
        type: 'interview_completed',
        title: 'Mock Interview Completed',
        description: `Completed ${interview.role} interview - Score: ${interview.score}/100`,
        metadata: { interviewId, score: interview.score }
      });

      console.log('✅ Firebase: Interview saved successfully with ID:', interviewId);
      return interviewId;
    } catch (error) {
      console.error('❌ Error saving mock interview:', error);
      throw error;
    }
  }

  static async getUserInterviews(uid: string): Promise<MockInterview[]> {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const interviews = LocalStorageService.loadData<MockInterview>(uid, 'interviews');
        return interviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      console.log('📂 Firebase: Loading user interviews');
      const interviewsRef = ref(database, `users/${uid}/interviews`);
      const snapshot = await get(interviewsRef);
      
      if (snapshot.exists()) {
        const interviews = this.convertFirebaseDataToArray<MockInterview>(snapshot.val());
        console.log('✅ Firebase: Interviews loaded:', interviews.length);
        return interviews;
      }
      
      console.log('📂 Firebase: No interviews found');
      return [];
    } catch (error) {
      console.error('❌ Error fetching interviews:', error);
      return [];
    }
  }

  // NEW: Delete mock interview
  static async deleteMockInterview(uid: string, interviewId: string) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        LocalStorageService.deleteItem(uid, 'interviews', interviewId);
        console.log('✅ Interview deleted from localStorage');
        return;
      }

      console.log('🗑️ Firebase: Deleting interview');
      const interviewRef = ref(database, `users/${uid}/interviews/${interviewId}`);
      await remove(interviewRef);
      console.log('✅ Firebase: Interview deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting interview:', error);
      throw error;
    }
  }

  // Activity Logging
  static async logActivity(uid: string, activity: {
    type: string;
    title: string;
    description: string;
    metadata?: any;
  }) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const activityWithId = {
          ...activity,
          id: this.generateId(),
          timestamp: new Date()
        };
        
        const activities = LocalStorageService.loadData(uid, 'activities');
        activities.unshift(activityWithId);
        // Keep only last 100 activities
        if (activities.length > 100) {
          activities.splice(100);
        }
        LocalStorageService.saveData(uid, 'activities', activities);
        return;
      }

      const activitiesRef = ref(database, `users/${uid}/activities`);
      const newActivityRef = push(activitiesRef);
      
      await set(newActivityRef, {
        ...activity,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error logging activity:', error);
    }
  }

  static async getUserActivities(uid: string) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const activities = LocalStorageService.loadData(uid, 'activities');
        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      const activitiesRef = ref(database, `users/${uid}/activities`);
      const snapshot = await get(activitiesRef);
      
      if (snapshot.exists()) {
        const activities = this.convertFirebaseDataToArray(snapshot.val());
        return activities;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error fetching activities:', error);
      return [];
    }
  }

  // Notifications
  static async createNotification(uid: string, notification: {
    type: 'success' | 'warning' | 'info' | 'reminder';
    title: string;
    message: string;
    actionUrl?: string;
  }) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const notificationWithId = {
          ...notification,
          id: this.generateId(),
          read: false,
          timestamp: new Date()
        };
        
        LocalStorageService.addItem(uid, 'notifications', notificationWithId);
        return;
      }

      const notificationsRef = ref(database, `users/${uid}/notifications`);
      const newNotificationRef = push(notificationsRef);
      
      await set(newNotificationRef, {
        ...notification,
        read: false,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error creating notification:', error);
    }
  }

  static async getUserNotifications(uid: string) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const notifications = LocalStorageService.loadData(uid, 'notifications');
        return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      const notificationsRef = ref(database, `users/${uid}/notifications`);
      const snapshot = await get(notificationsRef);
      
      if (snapshot.exists()) {
        const notifications = this.convertFirebaseDataToArray(snapshot.val());
        return notifications;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(uid: string, notificationId: string) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        LocalStorageService.updateItem(uid, 'notifications', notificationId, { read: true });
        return;
      }

      const notificationRef = ref(database, `users/${uid}/notifications/${notificationId}`);
      await update(notificationRef, { read: true });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  static async markAllNotificationsAsRead(uid: string) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - localStorage
        const notifications = LocalStorageService.loadData(uid, 'notifications');
        notifications.forEach((n: any) => n.read = true);
        LocalStorageService.saveData(uid, 'notifications', notifications);
        return;
      }

      const notificationsRef = ref(database, `users/${uid}/notifications`);
      const snapshot = await get(notificationsRef);
      
      if (snapshot.exists()) {
        const updates: any = {};
        Object.keys(snapshot.val()).forEach(key => {
          updates[`${key}/read`] = true;
        });
        await update(notificationsRef, updates);
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  }

  // Analytics and Stats - REAL DATA CALCULATION
  static async getUserStats(uid: string) {
    try {
      console.log('📊 Calculating user stats for:', uid);
      
      const [goals, roadmaps, interviews, activities] = await Promise.all([
        this.getUserGoals(uid),
        this.getUserRoadmaps(uid),
        this.getUserInterviews(uid),
        this.getUserActivities(uid)
      ]);

      const completedGoals = goals.filter(goal => goal.completed).length;
      const totalSteps = roadmaps.reduce((acc, roadmap) => acc + roadmap.steps.length, 0);
      const completedSteps = roadmaps.reduce((acc, roadmap) => 
        acc + roadmap.steps.filter(step => step.completed).length, 0
      );
      const avgInterviewScore = interviews.length > 0 
        ? Math.round(interviews.reduce((acc, interview) => acc + (interview.score || 0), 0) / interviews.length)
        : 0;

      // Calculate learning streak based on activities
      const learningStreak = this.calculateLearningStreak(activities);
      
      // Calculate weekly hours based on completed steps and goals
      const weeklyHours = this.calculateWeeklyHours(activities, completedSteps, completedGoals);

      const stats = {
        totalGoals: goals.length,
        completedGoals,
        activeRoadmaps: roadmaps.length,
        totalSteps,
        completedSteps,
        progressPercentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
        totalInterviews: interviews.length,
        avgInterviewScore,
        learningStreak,
        weeklyHours
      };

      console.log('📊 Real user stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      return {
        totalGoals: 0,
        completedGoals: 0,
        activeRoadmaps: 0,
        totalSteps: 0,
        completedSteps: 0,
        progressPercentage: 0,
        totalInterviews: 0,
        avgInterviewScore: 0,
        learningStreak: 0,
        weeklyHours: 0
      };
    }
  }

  // Calculate learning streak based on activity timestamps
  private static calculateLearningStreak(activities: any[]): number {
    if (activities.length === 0) return 0;

    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    let streak = 0;
    let currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Group activities by date
    const activitiesByDate = new Map<string, any[]>();
    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      const dateKey = `${activityDate.getFullYear()}-${activityDate.getMonth()}-${activityDate.getDate()}`;
      if (!activitiesByDate.has(dateKey)) {
        activitiesByDate.set(dateKey, []);
      }
      activitiesByDate.get(dateKey)!.push(activity);
    });

    // Count consecutive days with activities
    while (true) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
      if (activitiesByDate.has(dateKey)) {
        streak++;
        currentDate = new Date(currentDate.getTime() - oneDayMs);
      } else {
        break;
      }
    }

    return streak;
  }

  // Calculate weekly hours based on completed activities
  private static calculateWeeklyHours(activities: any[], completedSteps: number, completedGoals: number): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentActivities = activities.filter(activity => 
      new Date(activity.timestamp) >= oneWeekAgo
    );

    // Estimate hours based on activity types
    let totalHours = 0;
    recentActivities.forEach(activity => {
      switch (activity.type) {
        case 'roadmap_step':
          totalHours += 2; // Assume 2 hours per step
          break;
        case 'goal_completed':
          totalHours += 1; // Assume 1 hour per goal
          break;
        case 'interview_completed':
          totalHours += 0.5; // Assume 30 minutes per interview
          break;
        default:
          totalHours += 0.25; // Small amount for other activities
      }
    });

    return Math.round(totalHours);
  }
}