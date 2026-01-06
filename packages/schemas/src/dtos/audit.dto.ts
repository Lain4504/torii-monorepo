import { z } from 'zod';

/**
 * Audit Log Entry DTO
 * Used to create audit log entries across all modules
 */
export const auditLogEntryDTOSchema = z.object({
    userId: z.string().uuid(),
    userEmail: z.string().email(),
    userRole: z.string(),
    action: z.string(),
    entity: z.string(),
    entityId: z.string().optional(),
    description: z.string(),
    metadata: z.record(z.any()).optional(),
    oldValues: z.record(z.any()).optional(),
    newValues: z.record(z.any()).optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
});

export type AuditLogEntryDTO = z.infer<typeof auditLogEntryDTOSchema>;

/**
 * Audit Log Filters DTO
 * Used to query audit logs with filters and pagination
 */
export const auditLogFiltersDTOSchema = z.object({
    userId: z.string().uuid().optional(),
    action: z.string().optional(),
    entity: z.string().optional(),
    entityId: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
});

export type AuditLogFiltersDTO = z.infer<typeof auditLogFiltersDTOSchema>;

/**
 * Audit Context
 * Shared context for audit logging across modules
 */
export const auditContextDTOSchema = z.object({
    actorId: z.string().uuid(),
    actorEmail: z.string().email(),
    actorRole: z.string(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
});

export type AuditContextDTO = z.infer<typeof auditContextDTOSchema>;
