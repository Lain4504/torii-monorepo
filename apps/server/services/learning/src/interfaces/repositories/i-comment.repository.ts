import type { Comment, Prisma } from '@prisma/generated';

/**
 * Comment Repository Interface
 * Defines the contract for all comment data access operations
 */
export interface ICommentRepository {
  /**
   * Find comment by ID
   */
  findById(id: string): Promise<Comment | null>;

  /**
   * Find comment by ID with reply count
   */
  findByIdWithReplyCount(
    id: string,
  ): Promise<(Comment & { _count: { replies: number } }) | null>;

  /**
   * Find multiple comments with pagination and filters
   */
  findMany(options: {
    skip: number;
    take: number;
    where?: Prisma.CommentWhereInput;
    orderBy?: Prisma.CommentOrderByWithRelationInput;
    includeReplyCount?: boolean;
    currentUserId?: string;
  }): Promise<Comment[]>;

  /**
   * Count comments with optional filter
   */
  count(where?: Prisma.CommentWhereInput): Promise<number>;

  /**
   * Create new comment
   */
  create(data: Prisma.CommentCreateInput): Promise<Comment>;

  /**
   * Update comment by ID
   */
  update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment>;

  /**
   * Soft delete comment
   */
  softDelete(id: string): Promise<Comment>;

  /**
   * Find comment with nested replies
   */
  findWithReplies(
    id: string,
  ): Promise<
    (Comment & { replies: Comment[]; _count: { replies: number } }) | null
  >;
}
