import { z } from 'zod';

export const onboardingSurveyDTOSchema = z.object({
  targetCompletionTime: z.string().optional(),
  purpose: z.string().optional(),
  jlptTargetDate: z.string().datetime().optional().nullable(),
  studyFrequency: z.string().optional(),
  studyTimePerSession: z.string().optional(),
  currentLevel: z.string().optional(),
});

export type OnboardingSurveyDTO = z.infer<typeof onboardingSurveyDTOSchema>;
