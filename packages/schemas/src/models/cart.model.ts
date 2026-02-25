import { z } from 'zod';
import { baseModelSchema } from './base.model';

export const cartItemModelSchema = baseModelSchema.extend({
  cartId: z.string().uuid(),
  courseId: z.string().uuid(),
  addedAt: z.date(),
});

export type CartItem = z.infer<typeof cartItemModelSchema>;

export const cartModelSchema = baseModelSchema.extend({
  userId: z.string().uuid(),
  items: z.array(cartItemModelSchema).default([]),
});

export type Cart = z.infer<typeof cartModelSchema>;
