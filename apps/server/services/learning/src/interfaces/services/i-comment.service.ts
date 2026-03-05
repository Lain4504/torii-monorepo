import type {
  CommentCreateDTO,
  CommentUpdateDTO,
  CommentQueryDTO,
  CommentResponseDTO,
  CommentPaginatedResponse,
} from '@workspace/schemas';

/**
 * Comment Service Interface
 * Defines the contract for comment business logic operations
 */
export interface ICommentService {
  /**
   * Create new comment
   */
  createComment(dto: CommentCreateDTO): Promise<CommentResponseDTO>;

  /**
   * Find all comments with pagination and filters
   */
  findAllComments(query: CommentQueryDTO): Promise<CommentPaginatedResponse>;

  /**
   * Find comment by ID
   */
  findCommentById(id: string): Promise<CommentResponseDTO>;

  /**
   * Update comment
   */
  updateComment(
    id: string,
    authorId: string,
    dto: CommentUpdateDTO,
  ): Promise<CommentResponseDTO>;

  /**
   * Delete comment (soft delete)
   */
  deleteComment(
    id: string,
    authorId: string,
  ): Promise<{ success: boolean; message: string }>;

  /**
   * Get comment with nested replies
   */
  getCommentWithReplies(
    commentId: string,
    depth?: number,
  ): Promise<CommentResponseDTO | null>;
}
