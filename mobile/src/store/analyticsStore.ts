import { create } from 'zustand';
import apiClient from '../api/apiClient';

interface AnalyticsData {
  categoryBreakdown: { x: string; y: number }[];
  monthlyTrends: { month: string; income: number; expense: number }[];
  heatmap: { date: string; value: number }[];
}

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  fetchAnalytics: (type?: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  isLoading: false,
  fetchAnalytics: async (type = 'expense') => {
    set({ isLoading: true });
    try {
      const [breakdown, trends, heatmap] = await Promise.all([
        apiClient.get(`/analytics/spending-breakdown?type=${type}`),
        apiClient.get('/analytics/monthly-trends'),
        apiClient.get('/analytics/heatmap')
      ]);
      
      set({ 
        data: {
          categoryBreakdown: breakdown.data,
          monthlyTrends: trends.data,
          heatmap: heatmap.data
        },
        isLoading: false 
      });
    } catch (error) {
      console.log('Failed to fetch analytics', error);
      set({ isLoading: false });
    }
  }
}));
