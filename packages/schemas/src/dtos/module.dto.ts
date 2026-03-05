import { z } from 'zod';
import { moduleSchema } from '../models/module.model';

export const moduleCreateDTOSchema = moduleSchema
    .pick({
        courseMasterId: true,
        title: true,
        description: true,
        orderIndex: true,
        status: true,
        durationMinutes: true,
        createdBy: true,
    });

export type ModuleCreateDTO = z.infer<typeof moduleCreateDTOSchema>;

export const moduleUpdateDTOSchema = moduleSchema
    .pick({
        courseMasterId: true,
        title: true,
        description: true,
        orderIndex: true,
        status: true,
        durationMinutes: true,
    })
    .extend({
        updatedBy: z.string().uuid().optional(),
    })
    .partial();

export type ModuleUpdateDTO = z.infer<typeof moduleUpdateDTOSchema>;

export const moduleQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    courseMasterId: z.string().uuid().optional(),
    search: z.string().optional(),
    status: z.enum(['published', 'draft']).optional(),
});

export type ModuleQueryDTO = z.infer<typeof moduleQueryDTOSchema>;

export const moduleSearchRequestDTOSchema = moduleQueryDTOSchema;
export type ModuleSearchRequestDTO = z.infer<typeof moduleSearchRequestDTOSchema>;

import { moduleItemSchema } from '../models/module-item.model';

export const moduleResponseDTOSchema = moduleSchema.extend({
    items: z.array(moduleItemSchema).optional(),
});

export type ModuleResponseDTO = z.infer<typeof moduleResponseDTOSchema>;
