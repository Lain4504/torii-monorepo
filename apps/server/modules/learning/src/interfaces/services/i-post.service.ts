import type {
    PostCreateDTO,
    PostUpdateDTO,
    PostQueryDTO,
    PostResponseDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

/**
 * Post Service Interface
 * Defines the contract for post business logic operations
 */
export interface IPostService {
    /**
     * Create new post
     */
    createPost(dto: PostCreateDTO): Promise<PostResponseDTO>;

    /**
     * Find all posts with pagination and filters
     */
    findAllPosts(query: PostQueryDTO): Promise<PaginatedResponseDTO<PostResponseDTO>>;

    /**
     * Find post by ID
     */
    findPostById(id: string): Promise<PostResponseDTO>;

    /**
     * Update post
     */
    updatePost(id: string, dto: PostUpdateDTO): Promise<PostResponseDTO>;

    /**
     * Delete post
     */
    deletePost(id: string): Promise<{ success: boolean }>;

    /**
     * Increment view count for a post
     */
    incrementViewCount(id: string): Promise<void>;

    /**
     * Find post by slug
     */
    findPostBySlug(slug: string): Promise<PostResponseDTO>;
}

