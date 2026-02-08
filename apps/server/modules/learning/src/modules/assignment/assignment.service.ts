import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import type { Assignment } from '@prisma/generated';
import {
  type CreateAssignmentDto,
  type UpdateAssignmentDto,
  type QueryAssignmentsDto,
  type SubmitAssignmentDto,
  type GradeSubmissionDto,
  type ReturnSubmissionDto,
  AssignmentStatus,
  type Requester,
  type AssignmentResponseDTO,
} from '@workspace/schemas';

import { AssignmentRepository } from './assignment.repository';
import { SubmissionRepository } from '../submission/submission.repository';

/**
 * Assignment Service
 * Handles assignment business logic operations (BR-01 to BR-07)
 */
@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly submissionRepository: SubmissionRepository,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}


  /**
   * Helper to check permissions
   */
  private hasPermission(requester: Requester, permission: string): boolean {
    if (!requester.permissions) return false;
    return requester.permissions.includes('*') || requester.permissions.includes(permission);
  }

  /**
   * Map Assignment entity to AssignmentResponseDTO
   */
  private toAssignmentResponseDTO(assignment: Assignment): AssignmentResponseDTO {
    return this.mapper.map<Assignment, AssignmentResponseDTO>(assignment, 'Assignment', 'AssignmentResponseDTO');
  }

  /**
   * BR-01: Create Assignment
   */
  async create(requester: Requester, dto: CreateAssignmentDto) {
    // Permission check: Only instructor/admin can create
    if (!this.hasPermission(requester, 'assignment.create')) {
      throw new ForbiddenException('Only instructors can create assignments');
    }

    try {
      // Create assignment
      const assignment = await this.assignmentRepository.create({
        title: dto.title,
        description: dto.description,
        type: dto.type,
        courseId: dto.courseId,
        moduleId: dto.moduleId,
        lessonId: dto.lessonId,
        maxScore: dto.maxScore,
        passingScore: dto.passingScore,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        allowLateSubmission: dto.allowLateSubmission,
        latePenaltyPercent: dto.latePenaltyPercent,
        allowedFileTypes: dto.allowedFileTypes || [],
        maxFileSize: dto.maxFileSize,
        maxFiles: dto.maxFiles,
        instructions: dto.instructions,
        attachmentUrls: dto.attachmentUrls || [],
        createdBy: requester.sub,
        status: 'DRAFT', // Always start as draft
      } as any);


      return this.toAssignmentResponseDTO(assignment);
    } catch (error: any) {
      this.logger.error('Error creating assignment', error);
      throw new BadRequestException(`Failed to create assignment: ${error?.message}`);
    }
  }

  /**
   * Update Assignment
   */
  async update(requester: Requester, assignmentId: string, dto: UpdateAssignmentDto) {
    if (!this.hasPermission(requester, 'assignment.update')) {
      throw new ForbiddenException('Only instructors can update assignments');
    }

    const existing = await this.assignmentRepository.findById(assignmentId);
    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }

<<<<<<< HEAD
    // Strict ownership check: Only creator can update
    if (existing.createdBy !== requester.sub) {
=======
    // Check ownership
    if (existing.createdBy !== requester.sub && !this.hasPermission(requester, '*')) {
>>>>>>> main
      throw new ForbiddenException('You can only update your own assignments');
    }

    try {
      const updateData: any = {};
      if (dto.title) updateData.title = dto.title;
      if (dto.description) updateData.description = dto.description;
      if (dto.type) updateData.type = dto.type;
      if (dto.maxScore !== undefined) updateData.maxScore = dto.maxScore;
      if (dto.passingScore !== undefined) updateData.passingScore = dto.passingScore;
      if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);
      if (dto.allowLateSubmission !== undefined) updateData.allowLateSubmission = dto.allowLateSubmission;
      if (dto.latePenaltyPercent !== undefined) updateData.latePenaltyPercent = dto.latePenaltyPercent;
      if (dto.allowedFileTypes) updateData.allowedFileTypes = dto.allowedFileTypes;
      if (dto.maxFileSize) updateData.maxFileSize = dto.maxFileSize;
      if (dto.maxFiles) updateData.maxFiles = dto.maxFiles;
      if (dto.instructions) updateData.instructions = dto.instructions;
      if (dto.attachmentUrls) updateData.attachmentUrls = dto.attachmentUrls;

      const assignment = await this.assignmentRepository.update(assignmentId, updateData);


      return this.toAssignmentResponseDTO(assignment);
    } catch (error: any) {
      throw new BadRequestException(`Failed to update assignment: ${error?.message}`);
    }
  }

  /**
   * Publish Assignment (BR-01: Status transition draft → published)
   */
  async publish(requester: Requester, assignmentId: string) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

<<<<<<< HEAD
    // Strict ownership check: Only owner can publish
    if (assignment.createdBy !== requester.sub) {
      throw new ForbiddenException('Only the owner can publish this assignment');
=======
    if (assignment.createdBy !== requester.sub && !this.hasPermission(requester, '*')) {
      throw new ForbiddenException('Only the owner can publish');
>>>>>>> main
    }

    if (assignment.status === 'PUBLISHED') {
      throw new BadRequestException('Assignment is already published');
    }

    const updated = await this.assignmentRepository.update(assignmentId, {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });

    // BR-01: Emit notification to students
    this.natsClient.emit('assignment.published', {
      assignmentId: assignment.id,
      title: assignment.title,
      courseId: assignment.courseId,
      moduleId: assignment.moduleId,
      lessonId: assignment.lessonId,
      dueDate: assignment.dueDate,
    });


    return this.toAssignmentResponseDTO(updated);
  }

  /**
   * BR-02: Query Assignments
   */
  async findAll(requester: Requester, query: QueryAssignmentsDto) {
    const { page = 1, limit = 20, courseId, moduleId, lessonId, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by association
    if (courseId) where.courseId = courseId;
    if (moduleId) where.moduleId = moduleId;
    if (lessonId) where.lessonId = lessonId;

    // Status filter
    if (status) {
      where.status = status;
    } else {
      // Students only see published
      if (!this.hasPermission(requester, 'assignment.create')) {
        where.status = 'PUBLISHED';
      }
    }

<<<<<<< HEAD
    // Ownership filter: Everyone only sees their own assignments in management view
    // (Admin/Staff irrelevant per user request)
    if (this.hasPermission(requester, 'assignment.create') || this.hasPermission(requester, 'assignment.manage')) {
      where.createdBy = requester.sub;
    }

=======
>>>>>>> main
    const [total, assignments] = await Promise.all([
      this.assignmentRepository.count(where),
      this.assignmentRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

<<<<<<< HEAD
    // Fetch user's submissions for all assignments in this list
    const assignmentIds = assignments.map(a => a.id);
    const submissions = await this.submissionRepository.findMany({
      where: {
        assignmentId: { in: assignmentIds },
        userId: requester.sub,
      },
    });

    // Create a map of assignmentId -> submission status
    const submissionStatusMap = new Map();
    submissions.forEach(sub => {
      submissionStatusMap.set(sub.assignmentId, sub.status);
    });

    // Map assignments to DTOs with userSubmissionStatus
    const data = assignments.map(assignment => {
      const dto = this.toAssignmentResponseDTO(assignment);
      // Add user's submission status if exists
      const userStatus = submissionStatusMap.get(assignment.id);
      return {
        ...dto,
        userSubmissionStatus: userStatus || undefined,
      };
    });

    return {
      data,
=======
    return {
      data: assignments.map(a => this.toAssignmentResponseDTO(a)),
>>>>>>> main
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get Assignment Details
   */
  async findOne(assignmentId: string) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return this.toAssignmentResponseDTO(assignment);
  }

  /**
   * Delete Assignment
   */
  async delete(requester: Requester, assignmentId: string) {
    if (!this.hasPermission(requester, 'assignment.delete')) {
      throw new ForbiddenException('Only instructors can delete assignments');
    }

    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

<<<<<<< HEAD
    // Strict ownership check: Only creator can delete
    if (assignment.createdBy !== requester.sub) {
=======
    // Check ownership
    if (assignment.createdBy !== requester.sub && !this.hasPermission(requester, '*')) {
>>>>>>> main
      throw new ForbiddenException('You can only delete your own assignments');
    }

    // Check if there are submissions
    const submissionsCount = await this.submissionRepository.count({
      assignmentId,
      status: { in: ['SUBMITTED', 'GRADED'] },
    });

    if (submissionsCount > 0) {
      throw new BadRequestException(
        `Cannot delete assignment with ${submissionsCount} submissions. Consider closing it instead.`
      );
    }

    await this.assignmentRepository.delete(assignmentId);


    return { message: 'Assignment deleted successfully' };
  }
}
