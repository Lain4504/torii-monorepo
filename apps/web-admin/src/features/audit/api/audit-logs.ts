import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

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
        fullName: string;
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
    async query(filters: AuditLogFilters) {
        const params = new URLSearchParams();

        if (filters.userId) params.append('userId', filters.userId);
        if (filters.action) params.append('action', filters.action);
        if (filters.entity) params.append('entity', filters.entity);
        if (filters.entityId) params.append('entityId', filters.entityId);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const res = await apiClient.get(`/admin/audit-logs?${params.toString()}`);
        return res.data.data as PaginatedAuditLogs;
    },
};

// React Query hook
export function useAuditLogs(filters: AuditLogFilters) {
    return useQuery({
        queryKey: ['audit-logs', filters],
        queryFn: () => auditLogsApi.query(filters),
    });
}
