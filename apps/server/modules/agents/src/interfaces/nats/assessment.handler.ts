import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * NATS Handler for Assessment Agent
 * Handles inter-service communication via NATS messaging
 */
@Controller()
export class AssessmentHandler {
  constructor(
    private readonly fastMcpService: FastMcpService,
    @Inject('LEARNING_SERVICE') private readonly learningClient: ClientProxy,
  ) { }

  @MessagePattern({ cmd: 'agents.assessment.generateTest' })
  async generateTest(
    @Payload()
    data: {
      level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      section: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'full';
      questionCount?: number;
      userId: string;
    },
  ) {
    return this.fastMcpService.generateJlptTest(
      data.userId,
      data.level,
      data.section,
      data.questionCount || 10,
    );
  }

  @MessagePattern({ cmd: 'agents.assessment.evaluateTest' })
  async evaluateTest(
    @Payload()
    data: {
      testId: string;
      answers: Array<{ questionId: string; userAnswer: string; correctAnswer: string }>;
      userId: string;
    },
  ) {
    return this.fastMcpService.evaluateTest(
      data.userId,
      data.testId,
      data.answers,
    );
  }

  @MessagePattern({ cmd: 'agents.assessment.progressBenchmark' })
  async getProgressBenchmark(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    },
  ) {
    const level = (data.level || data.targetLevel || 'N5') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    return this.fastMcpService.getProgressBenchmark(data.userId, level);
  }

  @MessagePattern({ cmd: 'agents.assessment.scheduleTest' })
  async scheduleTest(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    },
  ) {
    const level = (data.level || data.targetLevel || 'N5') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    return this.fastMcpService.scheduleTest(data.userId, level);
  }

  @MessagePattern({ cmd: 'agents.assessment.placementTest' })
  async generatePlacementTest(
    @Payload()
    data: {
      userId: string;
      questionCount?: number;
    },
  ) {
    const targetCount = data.questionCount || 30; // Default to 30 questions

    // 1. Fetch Candidates from Learning Service
    // We request 3x the target count to give AI enough choice
    let candidatePool: any[] = [];
    try {
      candidatePool = await lastValueFrom(
        this.learningClient.send({ cmd: 'learning.question.getPlacement' }, { count: targetCount * 3 })
      );
      console.log(`[Agents] Fetched ${candidatePool?.length} candidates from Learning Service`);
    } catch (error) {
      console.error('[Agents] Failed to fetch candidates from Learning Service', error);
      throw new Error('Failed to retrieve question candidates');
    }

    if (!candidatePool || candidatePool.length === 0) {
      console.warn('[Agents] No candidates returned from Learning Service');
      throw new Error('No questions available for placement test');
    }

    // 2. Direct Selection (No AI Curation as requested)
    // Simply take the first N questions from the pool. 
    // (Assuming the pool is already randomized or sorted by the Learning service)
    const questionsToSend = candidatePool.slice(0, targetCount);

    // 4. Map to Frontend format
    const formattedQuestions = questionsToSend.map((q: any) => ({
      id: q.id,
      level: q.jlptLevel,
      type: q.questionType,
      question: q.questionText,
      options: typeof q.options === 'object' ? Object.values(q.options) : q.options,
    }));

    return {
      testId: uuidv4(),
      questions: formattedQuestions,
      estimatedTimeMinutes: targetCount // ~1 min per question approx
    };
  }

  @MessagePattern({ cmd: 'agents.assessment.evaluatePlacement' })
  async evaluatePlacementTest(
    @Payload()
    data: {
      userId: string;
      testId: string;
      answers: Record<string, string>; // questionId -> answer
    },
  ) {
    // OLD: return this.fastMcpService.evaluatePlacementTest(data.userId, data.testId, data.answers);

    // NEW: Deterministic Grading
    let correctCount = 0;
    const totalCount = Object.keys(data.answers).length;
    const scoreBreakdown: Record<string, string> = {};
    const detailedResults: any[] = [];

    // Process answers in parallel
    const gradingPromises = Object.entries(data.answers).map(async ([questionId, userAnswer]) => {
      try {
        const question = await lastValueFrom(
          this.learningClient.send({ cmd: 'learning.question.findOne' }, { id: questionId })
        );

        // Resolve Correct Answer (Key vs Value)
        let correctText = question.correctAnswer;
        let optionsArray: string[] = [];

        if (question.options && typeof question.options === 'object' && !Array.isArray(question.options)) {
          // Map format: { a: "text", b: "text" }
          // Ensure deterministic order (e.g. a,b,c,d) if keys are sortable, otherwise values
          optionsArray = Object.values(question.options as Record<string, string>);

          // If correct answer is a key (e.g. "a"), resolve it to text
          // We cast to any to avoid TS issues if type is unknown
          const opts = question.options as any;
          if (opts[question.correctAnswer]) {
            correctText = opts[question.correctAnswer];
          }
        } else {
          // Array format
          optionsArray = Array.isArray(question.options) ? question.options : [];
        }

        const isCorrect = correctText === userAnswer;
        if (isCorrect) correctCount++;

        scoreBreakdown[questionId] = isCorrect ? 'correct' : 'incorrect';

        detailedResults.push({
          id: questionId,
          question: question.questionText,
          options: optionsArray,
          correctAnswer: correctText,
          userAnswer: userAnswer,
          isCorrect,
          explanation: question.explanation
        });
      } catch (e) {
        console.error(`Failed to fetch question ${questionId}`, e);
        scoreBreakdown[questionId] = 'error';
      }
    });

    await Promise.all(gradingPromises);

    // Determine Level based on score percentage
    // Simple logic for now:
    // 0-20%: N5
    // 21-40%: N4
    // 41-60%: N3
    // 61-80%: N2
    // 81-100%: N1
    const percentage = (correctCount / (totalCount || 1)) * 100;
    let assessedLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N5';
    let targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4';

    if (percentage > 80) { assessedLevel = 'N1'; targetLevel = 'N1'; } // Mastered?
    else if (percentage > 60) { assessedLevel = 'N2'; targetLevel = 'N1'; }
    else if (percentage > 40) { assessedLevel = 'N3'; targetLevel = 'N2'; }
    else if (percentage > 20) { assessedLevel = 'N4'; targetLevel = 'N3'; }
    else { assessedLevel = 'N5'; targetLevel = 'N4'; }

    // Generate Study Path using AI with the determined level
    let studyPath;
    try {
      const aiResponse = await this.fastMcpService.suggestStudyPath(data.userId, targetLevel, '3 months');
      studyPath = aiResponse.studyPathRecommendation || aiResponse;

      // Validate structure - if invalid, throw to trigger fallback
      if (!studyPath || !studyPath.weeklySchedule || !Array.isArray(studyPath.weeklySchedule) || studyPath.weeklySchedule.length === 0) {
        throw new Error('Invalid study path generated');
      }
    } catch (error) {
      console.error('AI Study Path generation failed', error);
      // No mock data fallback - strictly utilize AI or fail
      studyPath = {
        estimatedWeeks: 0,
        focusAreas: [],
        weeklySchedule: []
      };
    }

    return {
      userId: data.userId,
      assessedLevel,
      targetLevel,
      scoreBreakdown,
      detailedResults,
      studyPathRecommendation: studyPath // Uses AI for the fancy roadmap
    };
  }
}
