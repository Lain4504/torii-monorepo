import type {
    ModuleResponseDTO,
    ModuleCreateDTO,
    ModuleUpdateDTO,
    PaginationOptionsDTO,
    PaginatedResponseDTO,
    Requester,
} from '@workspace/schemas';

/**
 * Module Service Interface
 * Defines the contract for module business logic operations
 */
export interface IModuleService {
    /**
     * Find all modules with pagination and search
     * @param options - Pagination options including page, limit, and search
     * @returns Paginated response of modules
     */
    findAll(options: PaginationOptionsDTO): Promise<PaginatedResponseDTO<ModuleResponseDTO>>;

    /**
     * Find one module by ID
     * @param moduleId - The module's unique identifier
     * @returns The module data
     * @throws NotFoundException if module not found
     */
    findOne(moduleId: string): Promise<ModuleResponseDTO>;

    /**
     * Find all modules for a specific course
     * @param courseId - The course's unique identifier
     * @returns Array of modules ordered by orderIndex
     */
    findByCourseId(courseId: string): Promise<ModuleResponseDTO[]>;

    /**
     * Create a new module
     * @param requester - The user making the request
     * @param dto - Module creation data
     * @returns The created module
     * @throws ForbiddenException if requester doesn't have permission
     */
    create(requester: Requester, dto: ModuleCreateDTO): Promise<ModuleResponseDTO>;

    /**
     * Update module
     * @param requester - The user making the request
     * @param moduleId - The module's unique identifier
     * @param dto - Module update data
     * @returns The updated module
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if module not found
     */
    update(requester: Requester, moduleId: string, dto: ModuleUpdateDTO): Promise<ModuleResponseDTO>;

    /**
     * Delete module (soft or hard delete)
     * @param requester - The user making the request
     * @param moduleId - The module's unique identifier
     * @param hardDelete - Whether to permanently delete (default: false for soft delete)
     * @returns Success message
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if module not found
     */
    delete(requester: Requester, moduleId: string, hardDelete?: boolean): Promise<{ message: string }>;

    /**
     * Reorder modules within a course
     * @param requester - The user making the request
     * @param courseId - The course's unique identifier
     * @param moduleOrders - Array of module IDs with their new order indices
     * @returns Success message
     * @throws ForbiddenException if requester doesn't have permission
     */
    reorder(
        requester: Requester,
        courseId: string,
        moduleOrders: { id: string; orderIndex: number }[]
    ): Promise<{ message: string }>;
}
