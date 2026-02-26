import type {
    WishlistCreateDTO,
    WishlistQueryDTO,
    WishlistResponseDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

/**
 * Wishlist Service Interface
 * Defines the contract for wishlist business logic operations
 */
export interface IWishlistService {
    /**
     * Find all wishlists with pagination and filters
     */
    findAll(query: WishlistQueryDTO): Promise<PaginatedResponseDTO<WishlistResponseDTO>>;

    /**
     * Find wishlist by ID
     */
    findById(id: string): Promise<WishlistResponseDTO | null>;

    /**
     * Create a new wishlist
     */
    create(input: WishlistCreateDTO): Promise<WishlistResponseDTO>;

    /**
     * Delete wishlist by ID
     */
    delete(id: string): Promise<boolean>;

    /**
     * Toggle wishlist (add if not exists, remove if exists)
     */
    toggle(userId: string, courseId: string): Promise<{ isInWishlist: boolean; wishlist?: WishlistResponseDTO }>;

    /**
     * Check if course is in user's wishlist
     */
    isInWishlist(userId: string, courseId: string): Promise<boolean>;
}

