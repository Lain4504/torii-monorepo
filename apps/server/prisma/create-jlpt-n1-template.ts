import 'tsconfig-paths/register';

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadConfig } from '@server/shared/config/app.config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Prisma } from '../generated/prisma/client';

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--templateId') out.templateId = argv[++i];
    else if (a === '--code') out.code = argv[++i];
    else if (a === '--title') out.title = argv[++i];
    else if (a === '--input') out.input = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out as {
    templateId?: string;
    code?: string;
    title?: string;
    input?: string;
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const templateId = args.templateId ?? '625ac154-38b5-493b-9fcf-a10649fbe0ec';
  const inputPath = args.input ?? '../../dataset/n1/part1.json';

  const combined = JSON.parse(readFileSync(resolve(process.cwd(), inputPath), 'utf-8')) as any;
  const sections = (combined.sections ?? []) as Array<{
    code?: string;
    sectionCode?: string;
    durationMinutes?: number;
  }>;

  const grammar = sections.find((s) => (s.code ?? s.sectionCode) === 'LANGUAGE_GRAMMAR_READING');
  const listening = sections.find((s) => (s.code ?? s.sectionCode) === 'LISTENING');

  let grammarDuration = Number(grammar?.durationMinutes ?? 110);
  let listeningDuration = Number(listening?.durationMinutes ?? 55);
  let totalDuration = grammarDuration + listeningDuration;

  const config = loadConfig();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: config.database.url }),
  });
  await prisma.$connect();

  try {
    // 1) Level (không upsert vì bạn đã tạo sẵn)
    const level = await prisma.jlptLevel.findUnique({
      where: { code: 'N1' as any },
      select: { id: true, code: true },
    });
    if (!level) {
      throw new Error('JLPT level N1 not found in DB. Vào `/academy/jlpt/config` tạo Level trước.');
    }

    // Sync duration từ DB (nếu bạn đã config đúng chuẩn trong config page).
    const grammarSectionFromDb = await prisma.jlptSection.findFirst({
      where: { levelId: level.id, code: 'LANGUAGE_GRAMMAR_READING' as any },
      select: { durationMinutes: true },
    });
    const listeningSectionFromDb = await prisma.jlptSection.findFirst({
      where: { levelId: level.id, code: 'LISTENING' as any },
      select: { durationMinutes: true },
    });
    if (grammarSectionFromDb?.durationMinutes != null) grammarDuration = Number(grammarSectionFromDb.durationMinutes);
    if (listeningSectionFromDb?.durationMinutes != null) listeningDuration = Number(listeningSectionFromDb.durationMinutes);
    totalDuration = grammarDuration + listeningDuration;

    // 2) Scoring profile đang active (không tự tạo/ghi đè)
    const scoringProfile = await prisma.jlptScoringProfile.findFirst({
      where: { levelId: level.id, isActive: true },
      select: { id: true },
    });
    if (!scoringProfile) {
      throw new Error('Không thấy scoring profile active cho N1. Vào `/academy/jlpt/config` bật active scoring profile trước khi seed.');
    }

    // 3) Template
    const existingTemplate = await prisma.jlptMockExamTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, status: true },
    });

    const code = (args.code as any) ?? 'N1_MOCK_01_NEW';
    const title = (args.title as any) ?? (combined.examTitle ?? 'JLPT N1 Mock Exam - New');

    if (!existingTemplate) {
      await prisma.jlptMockExamTemplate.create({
        data: {
          id: templateId,
          levelId: level.id,
          scoringProfileId: scoringProfile.id,
          code,
          title,
          description: null,
          status: 'PUBLISHED',
          availableFrom: null,
          availableTo: null,
          maxAttemptsPerUser: null,
          showDetailedReview: true,
          showCorrectAnswerImmediately: false,
          createdBy: null,
          updatedAt: new Date(),
          sections: {
            create: [
              {
                code: 'LANGUAGE_GRAMMAR_READING' as any,
                title: 'Ngữ pháp - Đọc hiểu',
                durationMinutes: grammarDuration,
                orderIndex: 1,
                isListening: false,
              },
              {
                code: 'LISTENING' as any,
                title: 'Nghe hiểu',
                durationMinutes: listeningDuration,
                orderIndex: 2,
                isListening: true,
              },
            ],
          },
        },
      });
    } else {
      // Update status in case it was created as draft before.
      await prisma.jlptMockExamTemplate.update({
        where: { id: templateId },
        data: {
          status: 'PUBLISHED',
          code,
          title,
          scoringProfileId: scoringProfile.id,
        },
      });

      // Upsert sections by (templateId, orderIndex)
      const existingSections = await prisma.jlptMockExamSection.findMany({
        where: { templateId },
        select: { id: true, orderIndex: true, code: true },
      });

      const upsertSection = async (orderIndex: number, codeSection: any, durationMinutes: number, isListening: boolean) => {
        const found = existingSections.find((s) => s.orderIndex === orderIndex);
        if (!found) {
          await prisma.jlptMockExamSection.create({
            data: {
              templateId,
              code: codeSection,
              title: codeSection === 'LANGUAGE_GRAMMAR_READING' ? 'Ngữ pháp - Đọc hiểu' : 'Nghe hiểu',
              durationMinutes,
              orderIndex,
              isListening,
            },
          });
          return;
        }
        await prisma.jlptMockExamSection.update({
          where: { id: found.id },
          data: {
            code: codeSection,
            durationMinutes,
            isListening,
            title: codeSection === 'LANGUAGE_GRAMMAR_READING' ? 'Ngữ pháp - Đọc hiểu' : 'Nghe hiểu',
          },
        });
      };

      await upsertSection(1, 'LANGUAGE_GRAMMAR_READING', grammarDuration, false);
      await upsertSection(2, 'LISTENING', listeningDuration, true);
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          levelId: level.id,
          scoringProfileId: scoringProfile.id,
          templateId,
          totalDurationMinutes: totalDuration,
          sections: { grammarDuration, listeningDuration },
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

