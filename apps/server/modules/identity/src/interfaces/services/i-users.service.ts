import type {
    UserResponseDTO,
    UserCreateDTO,
    UserUpdateDTO,
    PaginationOptionsDTO,
    PaginatedResponseDTO,
    Requester,
} from '@workspace/schemas';

/**
 * Users Service Interface
 * Defines the contract for user business logic operations
 */
export interface IUsersService {
    /**
     * Find all users with pagination and search
     * @param options - Pagination options including page, limit, and search
     * @returns Paginated response of users
     */
    findAll(options: PaginationOptionsDTO): Promise<PaginatedResponseDTO<UserResponseDTO>>;

    /**
     * Find one user by ID
     * @param userId - The user's unique identifier
     * @returns The user data
     * @throws NotFoundException if user not found
     */
    findOne(userId: string): Promise<UserResponseDTO>;

    /**
     * Create a new user (admin only)
     * @param dto - User creation data
     * @returns The created user
     * @throws BadRequestException if email already exists
     */
    create(dto: UserCreateDTO): Promise<UserResponseDTO>;

    /**
     * Get user profile
     * @param userId - The user's unique identifier
     * @returns The user's profile data
     * @throws NotFoundException if user not found
     */
    profile(userId: string): Promise<UserResponseDTO>;

    /**
     * Get user profile with RBAC permissions
     * Returns user info along with computed role and permissions
     * @param userId - The user's unique identifier
     * @returns User profile with permissions
     * @throws NotFoundException if user not found
     */
    getUserProfile(userId: string): Promise<any>;

    /**
     * Update user
     * @param requester - The user making the request
     * @param userId - The user's unique identifier
     * @param dto - User update data
     * @returns The updated user
     * @throws ForbiddenException if requester is not admin or the user themselves
     * @throws NotFoundException if user not found
     */
    update(requester: Requester, userId: string, dto: UserUpdateDTO): Promise<UserResponseDTO>;

    /**
     * Delete user (soft or hard delete)
     * @param requester - The user making the request
     * @param userId - The user's unique identifier
     * @param hardDelete - Whether to permanently delete (default: false for soft delete)
     * @returns Success message
     * @throws ForbiddenException if requester is not admin or the user themselves
     * @throws NotFoundException if user not found
     */
    delete(requester: Requester, userId: string, hardDelete?: boolean): Promise<{ message: string }>;
}
