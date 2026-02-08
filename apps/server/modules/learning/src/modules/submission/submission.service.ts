import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import type { Submission } from '@prisma/generated';
import type { 
  Requester, 
  SubmitAssignmentDto, 
  GradeSubmissionDto, 
  ReturnSubmissionDto,
  SubmissionResponseDTO 
} from '@workspace/schemas';

import { SubmissionRepository } from './submission.repository';
import { AssignmentRepository } from '../assignment/assignment.repository';

/**
 * Submission Service  
 * Handles submission business logic (BR-03 to BR-07)
 */
@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly assignmentRepository: AssignmentRepository,
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
   * Map Submission entity to SubmissionResponseDTO
   */
  private toSubmissionResponseDTO(submission: Submission): SubmissionResponseDTO {
    return this.mapper.map<Submission, SubmissionResponseDTO>(submission, 'Submission', 'SubmissionResponseDTO');
  }


  /**
   * BR-03: Submit Assignment (Draft auto-save)
   */
  async saveDraft(requester: Requester, assignmentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.status !== 'PUBLISHED') {
      throw new BadRequestException('Assignment is not published');
    }

    // Find existing draft
    const existing = await this.submissionRepository.findByAssignmentAndUser(assignmentId, requester.sub);

    const data: any = {
      textAnswer: dto.textAnswer,
      fileUrls: dto.fileUrls || [],
      status: 'DRAFT',
    };

    if (existing && existing.status === 'DRAFT') {
      // Update existing draft
      const submission = await this.submissionRepository.update(existing.id, data);
      return this.toSubmissionResponseDTO(submission);
    } else {
      // Create new draft
      const submission = await this.submissionRepository.create({
        assignment: { connect: { id: assignmentId } },
        userId: requester.sub,
        ...data,
        attemptNumber: existing ? existing.attemptNumber + 1 : 1,
      } as any);
      return this.toSubmissionResponseDTO(submission);
    }
  }

  /**
   * BR-03, BR-04: Submit Assignment officially
   */
  async submit(requester: Requester, assignmentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.status !== 'PUBLISHED') {
      throw new BadRequestException('Assignment is not published');
    }

    // Validate required fields based on assignment type
    if (assignment.type === 'TEXT' || assignment.type === 'BOTH') {
      if (!dto.textAnswer || dto.textAnswer.trim() === '') {
        throw new BadRequestException('Text answer is required');
      }
    }

    if (assignment.type === 'FILE' || assignment.type === 'BOTH') {
      if (!dto.fileUrls || dto.fileUrls.length === 0) {
        throw new BadRequestException('At least one file is required');
      }

      // Validate file count
      if (assignment.maxFiles && dto.fileUrls.length > assignment.maxFiles) {
        throw new BadRequestException(`Maximum ${assignment.maxFiles} files allowed`);
      }
    }

    // BR-03, BR-04: Late submission detection
    const submittedAt = new Date();
    let isLate = false;
    let daysLate = 0;

    if (assignment.dueDate) {
      const dueDate = new Date(assignment.dueDate);
      if (submittedAt > dueDate) {
        isLate = true;
        const diffMs = submittedAt.getTime() - dueDate.getTime();
        daysLate = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // milliseconds to days

        if (!assignment.allowLateSubmission) {
          throw new BadRequestException('This assignment does not allow late submissions');
        }
      }
    }

    // Find existing submission
    const existing = await this.submissionRepository.findByAssignmentAndUser(assignmentId, requester.sub);

    const data: any = {
      textAnswer: dto.textAnswer,
      fileUrls: dto.fileUrls || [],
      status: 'SUBMITTED',
      submittedAt,
      isLate,
      daysLate,
    };

    let submission: Submission;

    if (existing && existing.status === 'DRAFT') {
      // Update draft to submitted
      submission = await this.submissionRepository.update(existing.id, data);
    } else if (existing && existing.status === 'RETURNED') {
      // Resubmit after return
      submission = await this.submissionRepository.create({
        assignment: { connect: { id: assignmentId } },
        userId: requester.sub,
        ...data,
        attemptNumber: existing.attemptNumber + 1,
        previousSubmissionId: existing.id,
      } as any);
    } else {
      // New submission
      submission = await this.submissionRepository.create({
        assignment: { connect: { id: assignmentId } },
        userId: requester.sub,
        ...data,
        attemptNumber: 1,
      } as any);
    }

    // Emit notification to instructor
    this.natsClient.emit('submission.submitted', {
      submissionId: submission.id,
      assignmentId,
      userId: requester.sub,
      isLate,
      daysLate,
    });


    return this.toSubmissionResponseDTO(submission);
  }

  /**
   * BR-05, BR-07: Grade Submission
   */
  async grade(requester: Requester, submissionId: string, dto: GradeSubmissionDto) {
    console.log('🎯 Grade submission called:', { submissionId, dto, requester: requester.sub });
    
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const assignment = await this.assignmentRepository.findById(submission.assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    console.log('📊 Assignment maxScore:', assignment.maxScore, typeof assignment.maxScore);

    // Permission check: Only instructor can grade
    if (!this.hasPermission(requester, 'assignment.grade')) {
      console.error('❌ Permission denied: assignment.grade');
      throw new ForbiddenException('Only instructors can grade submissions');
    }

    // Ownership check: Only assignment owner or admin can grade
    if (assignment.createdBy !== requester.sub && !this.hasPermission(requester, '*')) {
      console.error('❌ Ownership check failed');
      throw new ForbiddenException('You can only grade submissions for your own assignments');
    }

    // Validate score
    const maxScore = typeof assignment.maxScore === 'object' ? Number(assignment.maxScore) : assignment.maxScore;
    console.log('✅ Converted maxScore:', maxScore, typeof maxScore);
    
    if (dto.score < 0 || dto.score > maxScore) {
      console.error('❌ Score validation failed:', { score: dto.score, maxScore });
      throw new BadRequestException(`Score must be between 0 and ${maxScore}`);
    }

    const graded = await this.submissionRepository.update(submissionId, {
      score: dto.score,
      feedback: dto.feedback,
      gradedBy: requester.sub,
      gradedAt: new Date(),
      status: 'GRADED',
    } as any);

    // BR-06: Emit notification to student
    this.natsClient.emit('submission.graded', {
      submissionId,
      userId: submission.userId,
      assignmentId: submission.assignmentId,
      score: dto.score,
      maxScore: assignment.maxScore,
      passed: dto.score >= Number(assignment.passingScore || 0),
    });

    // BR-07: Gamification integration (if passed)
    if (assignment.passingScore && dto.score >= Number(assignment.passingScore)) {
      this.natsClient.emit('assignment.completed', {
        userId: submission.userId,
        assignmentId: submission.assignmentId,
        courseId: assignment.courseId,
        score: dto.score,
        maxScore: assignment.maxScore,
        completedAt: new Date(),
        type: 'assignment', // For DailyActivity
      });
    }


    return this.toSubmissionResponseDTO(graded);
  }

  /**
   * Return Submission for revision
   */
  async returnSubmission(requester: Requester, submissionId: string, dto: ReturnSubmissionDto) {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const assignment = await this.assignmentRepository.findById(submission.assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Permission check
    if (!this.hasPermission(requester, 'assignment.grade')) {
      throw new ForbiddenException('Only instructors can return submissions');
    }

    // Ownership check
    if (assignment.createdBy !== requester.sub && !this.hasPermission(requester, '*')) {
      throw new ForbiddenException('You can only return submissions for your own assignments');
    }

    if (submission.status !== 'SUBMITTED' && submission.status !== 'GRADED') {
      throw new BadRequestException('Can only return submitted or graded submissions');
    }

    const returned = await this.submissionRepository.update(submissionId, {
      status: 'RETURNED',
      feedback: dto.feedback,
    } as any);

    // Emit notification
    this.natsClient.emit('submission.returned', {
      submissionId,
      userId: submission.userId,
      assignmentId: submission.assignmentId,
      feedback: dto.feedback,
    });

    return this.toSubmissionResponseDTO(returned);
  }

  /**
   * Get student's submission for an assignment
   */
  async getMySubmission(userId: string, assignmentId: string) {
    const submission = await this.submissionRepository.findByAssignmentAndUser(assignmentId, userId);
    return submission ? this.toSubmissionResponseDTO(submission) : null;
  }

  /**
   * Get all submissions for an assignment (instructor view)
   * BR-05: Only returns the latest attempt for each user
   */
  async getSubmissions(assignmentId: string) {
    const allSubmissions = await this.submissionRepository.findByAssignmentId(assignmentId);
    
    // Group by userId and pick the highest attemptNumber
    const latestSubmissionsMap = new Map<string, Submission>();
    
    for (const sub of allSubmissions) {
      const existing = latestSubmissionsMap.get(sub.userId);
      if (!existing || sub.attemptNumber > existing.attemptNumber) {
        latestSubmissionsMap.set(sub.userId, sub);
      }
    }

    const latestSubmissions = Array.from(latestSubmissionsMap.values());
    return latestSubmissions.map(s => this.toSubmissionResponseDTO(s));
  }
}
