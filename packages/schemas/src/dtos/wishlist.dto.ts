import { z } from 'zod';
import { wishlistSchema } from '../models/wishlist.model';

export const wishlistResponseDTOSchema = wishlistSchema.pick({
  id: true,
  userId: true,
  courseRunId: true,
  addedAt: true,
});

export type WishlistResponseDTO = z.infer<typeof wishlistResponseDTOSchema>;

export const wishlistCreateDTOSchema = z.object({
  courseRunId: z.string().uuid(),
});

export type WishlistCreateDTO = z.infer<typeof wishlistCreateDTOSchema>;

export const wishlistQueryDTOSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  userId: z.string().uuid().optional(),
  courseRunId: z.string().uuid().optional(),
});

export type WishlistQueryDTO = z.infer<typeof wishlistQueryDTOSchema>;

export const wishlistPaginatedResponseSchema = z.object({
  data: z.array(wishlistResponseDTOSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type WishlistPaginatedResponse = z.infer<
  typeof wishlistPaginatedResponseSchema
>;
