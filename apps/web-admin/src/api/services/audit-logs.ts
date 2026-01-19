import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';

// Types
export interface AuditLog {
    id: string;
    userId: string;
    userEmail: string;
    userRole: string;
    action: string;
    entity: string;
    entityId: string | null;
    description: string;
    metadata: Record<string, any> | null;
    oldValues: Record<string, any> | null;
    newValues: Record<string, any> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    user?: {
        id: string;
        email: string;
        displayName: string;
        role: string;
    };
}

export interface AuditLogFilters {
    userId?: string;
    action?: string;
    entity?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedAuditLogs {
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// API calls
const auditLogsApi = {
    async query(params: AuditLogFilters) {
        const res = await apiClient.get<PaginatedAuditLogs>('/api/admin/audit-logs', { params });
        return res.data;
    },
};

// React Query hook
export function useAuditLogs(filters: AuditLogFilters) {
    return useQuery({
        queryKey: ['audit-logs', filters],
        queryFn: () => auditLogsApi.query(filters),
    });
}

