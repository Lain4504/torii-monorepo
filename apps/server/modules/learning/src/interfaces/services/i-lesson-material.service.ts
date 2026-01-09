import type {
    LessonMaterialResponseDTO,
    LessonMaterialCreateDTO,
    LessonMaterialUpdateDTO,
    Requester,
} from '@workspace/schemas';

/**
 * Lesson Material Service Interface
 * Defines the contract for lesson material business logic operations
 */
export interface ILessonMaterialService {
    /**
     * Upload and create a new lesson material
     * @param requester - The user making the request
     * @param dto - Material creation data including lessonId, type, and title
     * @param file - File buffer to upload
     * @param fileName - Original file name
     * @param mimeType - File MIME type
     * @returns The created lesson material with file asset details
     * @throws ForbiddenException if lecturer doesn't have access to the lesson
     * @throws BadRequestException if MIME type is not allowed or lesson not found
     */
    uploadMaterial(
        requester: Requester,
        dto: LessonMaterialCreateDTO,
        file: Buffer,
        fileName: string,
        mimeType: string
    ): Promise<LessonMaterialResponseDTO>;

    /**
     * Get all materials for a lesson
     * @param lessonId - The lesson's unique identifier
     * @returns Array of lesson materials with file asset details
     * @throws NotFoundException if lesson not found
     */
    findByLessonId(lessonId: string): Promise<LessonMaterialResponseDTO[]>;

    /**
     * Update lesson material metadata
     * @param requester - The user making the request
     * @param materialId - The material's unique identifier
     * @param dto - Update data (title, orderIndex, type)
     * @returns The updated lesson material
     * @throws ForbiddenException if lecturer doesn't have access to the lesson
     * @throws NotFoundException if material not found
     */
    updateMaterial(
        requester: Requester,
        materialId: string,
        dto: LessonMaterialUpdateDTO
    ): Promise<LessonMaterialResponseDTO>;

    /**
     * Delete lesson material
     * @param requester - The user making the request
     * @param materialId - The material's unique identifier
     * @returns Success message
     * @throws ForbiddenException if lecturer doesn't have access to the lesson
     * @throws NotFoundException if material not found
     */
    deleteMaterial(
        requester: Requester,
        materialId: string
    ): Promise<{ message: string }>;
}
