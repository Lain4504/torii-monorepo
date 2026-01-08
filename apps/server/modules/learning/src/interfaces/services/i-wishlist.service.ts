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
    findOne(id: string): Promise<WishlistResponseDTO | null>;

    /**
     * Create a new wishlist
     */
    create(input: WishlistCreateDTO): Promise<WishlistResponseDTO>;

    /**
     * Delete wishlist by ID
     */
    delete(id: string): Promise<boolean>;
}

