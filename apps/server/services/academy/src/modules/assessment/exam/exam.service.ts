import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  AcademyExamCreateDTO,
  AcademyExamUpdateDTO,
  AcademyExamQueryDTO,
  AcademyExamAddQuestionsDTO,
} from '@workspace/schemas';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async createExam(dto: AcademyExamCreateDTO) {
    const { sections, ...data } = dto;
    return this.prisma.academyExam.create({
      data: {
        ...data,
        settings: (data.settings as any) || {},
        sections: {
          create: sections.map((sec) => ({
            title: sec.title,
            instruction: sec.instruction,
            timeLimitSeconds: sec.timeLimitSeconds,
            orderIndex: sec.orderIndex,
            sectionType: sec.sectionType,
            metadata: sec.metadata as any,
          })),
        },
      },
      include: {
        sections: true,
      },
    });
  }

  async updateExam(id: string, dto: AcademyExamUpdateDTO) {
    return this.prisma.academyExam.update({
      where: { id },
      data: {
        ...dto,
        settings: dto.settings as any,
      } as any,
    });
  }

  async findExams(query: AcademyExamQueryDTO) {
    const { courseProfileId, status, examType, q } = query;
    return this.prisma.academyExam.findMany({
      where: {
        courseProfileId: courseProfileId || undefined,
        status,
        examType,
        OR: q ? [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExamDetail(id: string) {
    const exam = await this.prisma.academyExam.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    options: true,
                  },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async addQuestionsToSection(dto: AcademyExamAddQuestionsDTO) {
    const { sectionId, questionIds, points } = dto;
    const section = await this.prisma.academyExamSection.findUnique({
      where: { id: sectionId },
    });
    if (!section) throw new NotFoundException('Section not found');

    // Get current max order index
    const lastQuestion = await this.prisma.academyExamQuestion.findFirst({
      where: { sectionId },
      orderBy: { orderIndex: 'desc' },
    });
    let nextOrder = (lastQuestion?.orderIndex ?? -1) + 1;

    const data = questionIds.map((qId) => ({
      examId: section.examId,
      sectionId,
      questionId: qId,
      points,
      orderIndex: nextOrder++,
    }));

    return this.prisma.academyExamQuestion.createMany({
      data,
    });
  }

  async removeQuestionFromExam(examQuestionId: string) {
    return this.prisma.academyExamQuestion.delete({
      where: { id: examQuestionId },
    });
  }

  async deleteExam(id: string) {
    // Check if used in Course Profile Assessments (connected to Live Classes via Cohorts)
    const assessments = await this.prisma.academyCourseProfileAssessment.findMany({
      where: { examId: id },
      include: {
        courseProfile: {
          include: {
            cohorts: {
              include: {
                liveClasses: true,
              },
            },
          },
        },
      },
    });

    const liveClassesInPlans = assessments.flatMap((a) =>
      a.courseProfile.cohorts.flatMap((c) => c.liveClasses.map((lc) => lc.name))
    );

    // Check if there are direct attempts in any LiveClass
    const attemptsWithClass = await this.prisma.academyExamAttempt.findMany({
      where: { examId: id, classId: { not: null } },
      include: { class: true },
    });

    const liveClassesInAttempts = attemptsWithClass
      .map((a) => a.class?.name)
      .filter(Boolean) as string[];

    // Collect all unique live class names
    const allClassNameSet = new Set([...liveClassesInPlans, ...liveClassesInAttempts]);
    const allClassNames = Array.from(allClassNameSet);

    if (allClassNames.length > 0) {
      throw new BadRequestException(
        `Bài thi này đang được sử dụng trong các lớp: ${allClassNames.join(
          ', '
        )}. Vui lòng gỡ bỏ khỏi kế hoạch học tập hoặc xóa các lượt thi trước khi xóa bài thi.`
      );
    }

    // Check for any other attempts (general usage / historical data)
    const totalAttempts = await this.prisma.academyExamAttempt.count({
      where: { examId: id },
    });

    if (totalAttempts > 0) {
      throw new BadRequestException(
        `Bài thi này đã có ${totalAttempts} lượt làm bài của học viên. Vui lòng xóa các lượt làm bài trước khi xóa bài thi.`
      );
    }

    return this.prisma.academyExam.delete({
      where: { id },
    });
  }
}
