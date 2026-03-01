import { z } from 'zod';

export const wishlistSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  courseRunId: z.string().uuid(),
  addedAt: z.date(),
});

export type Wishlist = z.infer<typeof wishlistSchema>;
