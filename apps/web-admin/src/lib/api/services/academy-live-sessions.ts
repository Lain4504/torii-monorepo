import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type { StandardApiResponse } from "@workspace/schemas"

export type AcademyLiveSessionJoinResponse = {
  token: string
  roomId: string
  roomTitle: string
  userId?: string
}

export const academyLiveSessionsApi = {
  async joinAsLecturer(scheduleId: string) {
    const res = await apiClient.post<
      StandardApiResponse<AcademyLiveSessionJoinResponse>
    >(`/api/live-sessions/${scheduleId}/join/lecturer`)
    return res.data.data!
  },
}

export function useJoinAcademyLiveSessionAsLecturer() {
  return useMutation({
    mutationFn: (scheduleId: string) =>
      academyLiveSessionsApi.joinAsLecturer(scheduleId),
  })
}
