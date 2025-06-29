import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DataService } from '../services/dataService';
import type { Goal, Roadmap, MockInterview } from '../types';

export const useUserData = () => {
  const { currentUser } = useAuth();
  // Initializing with empty arrays and default numbers for stats properties
  const [goals, setGoals] = useState<Goal[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [stats, setStats] = useState({
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
  });
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Fetching user data for:', currentUser.uid);
      
      const [userGoals, userRoadmaps, userInterviews, userStats] = await Promise.all([
        DataService.getUserGoals(currentUser.uid),
        DataService.getUserRoadmaps(currentUser.uid),
        DataService.getUserInterviews(currentUser.uid),
        DataService.getUserStats(currentUser.uid)
      ]);

      console.log('📊 Fetched data:', {
        goals: userGoals.length,
        roadmaps: userRoadmaps.length,
        interviews: userInterviews.length,
        stats: userStats
      });

      setGoals(userGoals);
      setRoadmaps(userRoadmaps);
      setInterviews(userInterviews);
      // Ensure userStats has all expected properties or merge with defaults
      setStats(prevStats => ({
        ...prevStats, // Keep existing defaults if not overridden by fetched data
        ...userStats
      }));
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      // Optionally reset to initial state on error to ensure consistency
      setGoals([]);
      setRoadmaps([]);
      setInterviews([]);
      setStats({
        totalGoals: 0, completedGoals: 0, activeRoadmaps: 0, totalSteps: 0,
        completedSteps: 0, progressPercentage: 0, totalInterviews: 0,
        avgInterviewScore: 0, learningStreak: 0, weeklyHours: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  const refreshData = () => {
    console.log('🔄 Refreshing user data...');
    fetchUserData();
  };

  return {
    goals,
    roadmaps,
    interviews,
    stats,
    loading,
    refreshData
  };
};