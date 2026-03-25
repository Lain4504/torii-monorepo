import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse } from '@workspace/schemas';

export type RoadmapCurrentResponse = {
  roadmapId: string | null;
  pathVersion: number;
  include?: string[];
  weeklyPlan: Array<{
    week_index: number;
    objective: string;
    estimated_minutes: number;
    tasks: Array<{
      task_id: string;
      title: string;
      priority: string;
      estimated_minutes: number;
      task_type: string;
      status?: string;
      due_at?: string | null;
      completed_at?: string | null;
    }>;
  }>;
};

export const learningPathApi = {
  async getRoadmapCurrent(
    include = 'weeks,tasks,insights',
  ): Promise<RoadmapCurrentResponse> {
    const response = await apiClient.get<StandardApiResponse<RoadmapCurrentResponse>>(
      `/api/v1/roadmaps/current?include=${encodeURIComponent(include)}`,
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch roadmap');
  },

  async patchTaskStatus(input: {
    roadmapId: string;
    taskId: string;
    status: 'completed';
    actual_minutes?: number | null;
    completed_at?: string | null;
  }) {
    const { roadmapId, taskId, status, actual_minutes, completed_at } = input;
    const response = await apiClient.patch<StandardApiResponse<any>>(
      `/api/v1/roadmaps/${roadmapId}/tasks/${taskId}`,
      {
        status,
        actual_minutes,
        completed_at,
      },
    );

    if (response.data.success) return response.data.data ?? response.data;
    throw new Error(response.data.message || 'Failed to update task status');
  },

  async getProgressOverview() {
    const response = await apiClient.get<StandardApiResponse<any>>(
      '/api/v1/progress/overview',
    );
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch progress');
  },

  async getNextActions() {
    const response = await apiClient.get<StandardApiResponse<any>>(
      '/api/v1/interventions/next-actions',
    );
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch next actions');
  },

  async createRecoveryPlan(input?: { recovery_window_days?: number; inactive_days?: number }) {
    const response = await apiClient.post<StandardApiResponse<any>>(
      '/api/v1/interventions/recovery-plan',
      input ?? {},
    );
    if (response.data.success) return response.data.data ?? response.data;
    throw new Error(response.data.message || 'Failed to create recovery plan');
  },
};

export function useRoadmapCurrent() {
  return useQuery({
    queryKey: ['learning-path', 'roadmap-current'],
    queryFn: () => learningPathApi.getRoadmapCurrent(),
    staleTime: 60_000,
  });
}

export function useCompleteRoadmapTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      roadmapId: string;
      taskId: string;
      actualMinutes?: number;
    }) =>
      learningPathApi.patchTaskStatus({
        roadmapId: input.roadmapId,
        taskId: input.taskId,
        status: 'completed',
        actual_minutes: input.actualMinutes ?? null,
        completed_at: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['learning-path', 'roadmap-current'],
      });
      queryClient.invalidateQueries({
        queryKey: ['learning-path', 'progress-overview'],
      });
    },
  });
}

export function useProgressOverview() {
  return useQuery({
    queryKey: ['learning-path', 'progress-overview'],
    queryFn: () => learningPathApi.getProgressOverview(),
    staleTime: 30_000,
  });
}

export function useNextActions(enabled: boolean) {
  return useQuery({
    queryKey: ['learning-path', 'next-actions'],
    queryFn: () => learningPathApi.getNextActions(),
    enabled,
    staleTime: 30_000,
  });
}

export function useCreateRecoveryPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: {
      recovery_window_days?: number;
      inactive_days?: number;
    }) => learningPathApi.createRecoveryPlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['learning-path', 'progress-overview'],
      });
      queryClient.invalidateQueries({
        queryKey: ['learning-path', 'roadmap-current'],
      });
      queryClient.invalidateQueries({
        queryKey: ['learning-path', 'next-actions'],
      });
    },
  });
}

