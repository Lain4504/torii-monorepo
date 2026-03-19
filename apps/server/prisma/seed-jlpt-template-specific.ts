import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient, Prisma } from '@prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadConfig } from '@server/shared/config/app.config';

type JlptSectionCode = 'LANGUAGE_VOCAB' | 'LANGUAGE_GRAMMAR_READING' | 'LISTENING';
type JlptQuestionType = 'VOCAB' | 'GRAMMAR' | 'READING' | 'LISTENING';
type JlptDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

type DatasetQuestion = {
  level?: string;
  question_type: string;
  section_code: string;
  group_code: string;
  question_index: number;
  stem_text: string;
  context_text?: string | null;
  difficulty?: string;
  options: Array<{
    key: string;
    content_text: string;
    is_correct: boolean;
  }>;
  // Dataset "source" is used as a stable-ish identity.
  source?: {
    provider?: string;
    csv_path?: string;
    raw_id?: string | number;
    raw?: any;
  };
};

type Dataset = {
  level?: string;
  sections: Array<{
    code: string;
    order_index?: number;
    duration_minutes?: number;
    title_vi?: string;
    questions: DatasetQuestion[];
  }>;
};

type NestedDataset = {
  levelCode?: string;
  sections: Array<{
    code: string;
    orderIndex?: number;
    durationMinutes?: number;
    duration_minutes?: number;
    title_vi?: string;
    titleVi?: string;
    order_index?: number;
    mondais: Array<{
      mondaiCode: string;
      titleJa?: string | null;
      titleVi?: string | null;
      orderIndex: number;
      questions: Array<{
        stemText: string;
        contextText?: string | null;
        explanation?: string | null;
        difficulty?: string;
        orderIndex?: number;
        questionType?: string;
        options: Array<{
          key: string;
          contentText: string;
          isCorrect: boolean;
          orderIndex?: number;
        }>;
      }>;
    }>;
  }>;
};

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry') out.dry = true;
    else if (a === '--mode') out.mode = argv[++i];
    else if (a === '--templateId') out.templateId = argv[++i];
    else if (a === '--sectionCode') out.sectionCode = argv[++i];
    else if (a === '--input') out.input = argv[++i];
    else if (a === '--take') out.take = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out as {
    dry?: boolean;
    mode?: 'append' | 'replace';
    templateId?: string;
    sectionCode?: JlptSectionCode;
    input?: string;
    take?: string;
  };
}

function buildSourceIdentity(q: DatasetQuestion) {
  const provider = q.source?.provider;
  const csvPath = q.source?.csv_path;
  const qIndex = q.question_index;

  // Keep under 255 chars. This is only used for best-effort dedup.
  const sourceRefParts = [provider, csvPath, String(qIndex)].filter(Boolean);
  const sourceRef = sourceRefParts.join(':').slice(0, 255);

  return {
    sourceProvider: provider ?? null,
    sourceRef: sourceRef || null,
    sourcePayload: q.source ?? null,
  };
}

function normalizeQuestionType(input?: string | null): JlptQuestionType | null {
  if (!input) return null;
  const v = String(input).toUpperCase().trim();
  if (v === 'VOCAB') return 'VOCAB';
  if (v === 'GRAMMAR') return 'GRAMMAR';
  if (v === 'READING') return 'READING';
  if (v === 'LISTENING') return 'LISTENING';
  return null;
}

function inferQuestionTypeFromMondaiCode(mondaiCode: string): JlptQuestionType {
  const code = String(mondaiCode).toUpperCase();
  if (code.includes('_R_') || code.includes('READING')) return 'READING';
  if (code.includes('_G_') || code.includes('GRAMMAR')) return 'GRAMMAR';
  return 'VOCAB';
}

async function ensureGlobalSection(
  prisma: PrismaClient,
  levelId: string,
  sectionCode: JlptSectionCode,
  seed?: {
    durationMinutes?: number;
    orderIndex?: number;
  },
  dry?: boolean,
) {
  const existing = await prisma.jlptSection.findFirst({
    where: { levelId, code: sectionCode },
  });
  if (existing) return existing;

  if (dry) {
    throw new Error(
      `Global section missing in DB (dry-run): levelId=${levelId}, sectionCode=${sectionCode}`,
    );
  }

  return prisma.jlptSection.create({
    data: {
      levelId,
      code: sectionCode,
      nameVi: sectionCode,
      durationMinutes: seed?.durationMinutes ?? 110,
      orderIndex: seed?.orderIndex ?? 1,
      isListening: sectionCode === 'LISTENING',
    },
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const templateId = args.templateId ?? '625ac154-38b5-493b-9fcf-a10649fbe0ec';
  const sectionCode = args.sectionCode ?? 'LANGUAGE_GRAMMAR_READING';
  const inputPath = args.input ?? '../../dataset/jlpt_n1_mock_exam_2024_filtered.json';
  const dry = !!args.dry;
  const mode = args.mode ?? 'append';
  const take = args.take ? Number(args.take) : undefined;
  const takeInt = take != null ? Math.max(1, take) : undefined;

  const absInputPath = resolve(process.cwd(), inputPath);
  const raw = readFileSync(absInputPath, 'utf-8');
  const dataset = JSON.parse(raw) as Dataset | NestedDataset;

  const config = loadConfig();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: config.database.url,
    }),
  });

  // Ensure connection explicitly for scripts.
  await prisma.$connect();

  try {
    const template = await prisma.jlptMockExamTemplate.findUnique({
      where: { id: templateId },
      include: { level: true, sections: true },
    });
    if (!template) throw new Error(`Template not found: ${templateId}`);

    const templateSection = template.sections.find((s) => s.code === sectionCode);
    if (!templateSection) {
      throw new Error(`Template section not found: templateId=${templateId}, sectionCode=${sectionCode}`);
    }

    const existingTotalTemplateQuestions = await prisma.jlptMockExamTemplateQuestion.count({
      where: { templateId },
    });
    const existingSectionTemplateQuestions = await prisma.jlptMockExamTemplateQuestion.count({
      where: { templateId, sectionId: templateSection.id },
    });
    console.log(
      `[preflight] templateId=${templateId} templateQuestions(total)=${existingTotalTemplateQuestions}, thisSection=${existingSectionTemplateQuestions}`,
    );

    const datasetSection = dataset.sections.find((s) => s.code === sectionCode);
    if (!datasetSection) {
      throw new Error(`Input JSON section not found: sectionCode=${sectionCode}`);
    }

    const nestedMondaiList = (datasetSection as any).mondais;
    const isNested = Array.isArray(nestedMondaiList);

    const sectionDurationMinutes =
      (datasetSection as any).duration_minutes ??
      (datasetSection as any).durationMinutes ??
      undefined;
    const sectionOrderIndex =
      (datasetSection as any).order_index ??
      (datasetSection as any).orderIndex ??
      undefined;

    const globalLevelId = template.levelId;
    const globalSection = await ensureGlobalSection(
      prisma,
      globalLevelId,
      sectionCode,
      {
        durationMinutes: sectionDurationMinutes ?? undefined,
        orderIndex: sectionOrderIndex ?? undefined,
      },
      dry,
    );

    if (mode === 'replace' && !dry) {
      // Best-effort replacement: delete mappings for this template + section, leaving bank/questions intact.
      await prisma.jlptMockExamTemplateQuestion.deleteMany({
        where: { templateId, sectionId: templateSection.id },
      });
    }

    const existingMaxOrder = await prisma.jlptMockExamTemplateQuestion.aggregate({
      where: { templateId },
      _max: { orderIndex: true },
    });
    // NOTE: `jlptMockExamTemplateQuestion` has a unique constraint on (templateId, orderIndex),
    // so `orderIndex` must be globally unique across all sections of the template.
    // Therefore, always append after the current max.
    const startOrderIndex = (existingMaxOrder._max.orderIndex ?? 0) + 1;

    let processed = 0;
    let createdBank = 0;
    let updatedBank = 0;
    let upsertedTplMapping = 0;

    const orderIndexInLoopBase = startOrderIndex;
    let orderIndexInLoop = orderIndexInLoopBase;

    if (isNested) {
      // Nested JSON mode: sections[].mondais[].mondaiCode
      const nestedSection = datasetSection as any as NestedDataset['sections'][number];
      const mondais = nestedSection.mondais ?? [];

      if (!dry) {
        // Quick mismatch insight with existing template
        const existingMondais = await prisma.jlptMockExamMondai.findMany({
          where: { sectionId: templateSection.id },
          select: { code: true },
        });
        const existingCodes = new Set(existingMondais.map((m) => m.code));
        const inputCodes = new Set(mondais.map((m: any) => m.mondaiCode));
        const missingInInput = [...existingCodes].filter((c) => !inputCodes.has(c));
        const missingInTemplate = [...inputCodes].filter((c) => !existingCodes.has(c));
        if (missingInInput.length > 0) {
          console.log(`[nested preflight] template mondai missing in input: ${missingInInput.join(', ')}`);
        }
        if (missingInTemplate.length > 0) {
          console.log(`[nested preflight] input mondai missing in template (will be created/upserted): ${missingInTemplate.join(', ')}`);
        }
      }

      const globalMondaiIdByCode = new Map<string, string>();
      const templateMondaiIdByCode = new Map<string, string>();

      for (const m of mondais) {
        const mondaiCode = String(m.mondaiCode);
        const orderIndex = Number(m.orderIndex ?? 0);
        const titleVi = (m.titleVi ?? mondaiCode) as string;
        const titleJa = m.titleJa ?? null;

        if (dry) {
          globalMondaiIdByCode.set(mondaiCode, `__dry_global_${mondaiCode}`);
          templateMondaiIdByCode.set(mondaiCode, `__dry_tpl_${mondaiCode}`);
          continue;
        }

        const globalMondai = await prisma.jlptMondai.upsert({
          where: { sectionId_code: { sectionId: globalSection.id, code: mondaiCode } },
          update: {
            titleVi,
            titleJa,
            orderIndex,
          },
          create: {
            sectionId: globalSection.id,
            code: mondaiCode,
            titleVi,
            titleJa,
            orderIndex,
          },
        });
        globalMondaiIdByCode.set(mondaiCode, globalMondai.id);

        const tplMondai = await prisma.jlptMockExamMondai.upsert({
          where: { sectionId_code: { sectionId: templateSection.id, code: mondaiCode } },
          update: {
            titleVi,
            titleJa,
            orderIndex,
          },
          create: {
            sectionId: templateSection.id,
            code: mondaiCode,
            titleVi,
            titleJa,
            orderIndex,
          },
        });
        templateMondaiIdByCode.set(mondaiCode, tplMondai.id);
      }

      // Flatten questions in mondai order, apply take.
      let processedQuestions = 0;
      for (const m of mondais) {
        const mondaiCode = String(m.mondaiCode);
        const globalMondaiId = globalMondaiIdByCode.get(mondaiCode);
        const templateMondaiId = templateMondaiIdByCode.get(mondaiCode);
        if (!globalMondaiId || !templateMondaiId) {
          throw new Error(`Missing mondai ids for mondaiCode=${mondaiCode}`);
        }

        for (const q of (m.questions ?? []) as any[]) {
          if (takeInt && processedQuestions >= takeInt) break;
          processedQuestions += 1;
          if (dry) {
            processed += 1;
            if (processed % 50 === 0) {
              console.log(`[dry progress] processed=${processed}, orderIndex=${orderIndexInLoop}`);
            }
            orderIndexInLoop += 1;
            continue;
          }

          const inferredType = inferQuestionTypeFromMondaiCode(mondaiCode);
          const questionType = normalizeQuestionType(q.questionType ?? null) ?? inferredType;
          const difficulty = (q.difficulty ?? 'EASY') as JlptDifficulty;

          const sourceProvider = 'manual';
          const sourceRef = `${mondaiCode}:${String(q.orderIndex ?? processedQuestions)}`.slice(0, 255);
          const optionCreates = (q.options ?? []).map((o: any, idx: number) => ({
            key: o.key,
            contentText: o.contentText,
            isCorrect: !!o.isCorrect,
            orderIndex: o.orderIndex ?? idx,
          }));

          const existing = await prisma.jlptQuestionBankQuestion.findFirst({
            where: {
              levelId: globalLevelId,
              sectionCode,
              questionType,
              mondaiId: globalMondaiId,
              sourceProvider,
              sourceRef,
            },
            include: { options: true },
          });

          let bankQuestionId: string;
          if (!existing) {
            const created = await prisma.jlptQuestionBankQuestion.create({
              data: {
                levelId: globalLevelId,
                sectionCode,
                mondaiId: globalMondaiId,
                questionType,
                stemText: q.stemText,
                contextText: q.contextText ?? null,
                explanation: q.explanation ?? null,
                difficulty,
                sourceProvider,
                sourceRef,
                sourcePayload: Prisma.DbNull,
                options: { create: optionCreates },
              },
              select: { id: true },
            });
            bankQuestionId = created.id;
            createdBank += 1;
          } else {
            const updated = await prisma.jlptQuestionBankQuestion.update({
              where: { id: existing.id },
              data: {
                stemText: q.stemText,
                contextText: q.contextText ?? null,
                explanation: q.explanation ?? null,
                difficulty,
                options: {
                  deleteMany: {},
                  create: optionCreates,
                },
              },
              select: { id: true },
            });
            bankQuestionId = updated.id;
            updatedBank += 1;
          }

          await prisma.jlptMockExamTemplateQuestion.upsert({
            where: {
              templateId_orderIndex: {
                templateId,
                orderIndex: orderIndexInLoop,
              },
            },
            create: {
              templateId,
              sectionId: templateSection.id,
              mondaiId: templateMondaiId,
              questionId: bankQuestionId,
              orderIndex: orderIndexInLoop,
              weight: null,
            },
            update: {
              sectionId: templateSection.id,
              mondaiId: templateMondaiId,
              questionId: bankQuestionId,
              weight: null,
            },
          });

          upsertedTplMapping += 1;
          processed += 1;
          orderIndexInLoop += 1;

          if (processed % 50 === 0) {
            console.log(`[progress] processed=${processed}, orderIndex=${orderIndexInLoop - 1}`);
          }
        }
        if (takeInt && processedQuestions >= takeInt) break;
      }
    } else {
      // Flat JSON mode: sections[].questions[]
      const datasetFlatSection = datasetSection as any as Dataset['sections'][number];
      const questionsToProcess = takeInt
        ? datasetFlatSection.questions.slice(0, takeInt)
        : datasetFlatSection.questions;

      const groupsInOrder = new Map<string, number>(); // group_code -> orderIndex
      let groupOrder = 1;
      for (const q of questionsToProcess) {
        if (!groupsInOrder.has(q.group_code)) {
          groupsInOrder.set(q.group_code, groupOrder);
          groupOrder += 1;
        }
      }

      // Ensure Global/JLPT-Mondai and Template-specific/JLPT-MockExam-Mondai exist for every group_code.
      const globalMondaiIdByCode = new Map<string, string>();
      const templateMondaiIdByCode = new Map<string, string>();

      if (!dry) {
        const existingTemplateMondais = await prisma.jlptMockExamMondai.findMany({
          where: { sectionId: templateSection.id },
          select: { code: true },
        });
        const existingMondaiCodes = new Set(existingTemplateMondais.map((m) => m.code));
        const inputMondaiCodes = new Set([...groupsInOrder.keys()]);
        const missingInInput = [...existingMondaiCodes].filter((c) => !inputMondaiCodes.has(c));
        if (missingInInput.length > 0) {
          console.log(
            `[flat preflight] template mondai missing in input group_code: ${missingInInput.join(', ')}`,
          );
        }
      }

      for (const [mondaiCode, orderIndex] of groupsInOrder) {
        if (dry) {
          globalMondaiIdByCode.set(mondaiCode, `__dry_global_${mondaiCode}`);
          templateMondaiIdByCode.set(mondaiCode, `__dry_tpl_${mondaiCode}`);
          continue;
        }

        const globalMondai = await prisma.jlptMondai.upsert({
          where: { sectionId_code: { sectionId: globalSection.id, code: mondaiCode } },
          update: {
            titleVi: mondaiCode,
            orderIndex,
          },
          create: {
            sectionId: globalSection.id,
            code: mondaiCode,
            titleVi: mondaiCode,
            orderIndex,
          },
        });
        globalMondaiIdByCode.set(mondaiCode, globalMondai.id);

        const tplMondai = await prisma.jlptMockExamMondai.upsert({
          where: { sectionId_code: { sectionId: templateSection.id, code: mondaiCode } },
          update: {
            titleVi: mondaiCode,
            orderIndex,
          },
          create: {
            sectionId: templateSection.id,
            code: mondaiCode,
            titleVi: mondaiCode,
            orderIndex,
          },
        });
        templateMondaiIdByCode.set(mondaiCode, tplMondai.id);
      }

      // Seed Bank questions + Template mappings
      for (const q of questionsToProcess) {
        const questionType = q.question_type as JlptQuestionType;
        const difficulty = (q.difficulty ?? 'EASY') as JlptDifficulty;

        const globalMondaiId = globalMondaiIdByCode.get(q.group_code);
        const templateMondaiId = templateMondaiIdByCode.get(q.group_code);
        if (!globalMondaiId || !templateMondaiId) {
          throw new Error(`Missing mondai mapping for group_code=${q.group_code}`);
        }

        if (dry) {
          processed += 1;
          if (processed % 50 === 0) {
            console.log(`[dry progress] processed=${processed}, orderIndex=${orderIndexInLoop}`);
          }
          orderIndexInLoop += 1;
          continue;
        }

        const { sourceProvider, sourceRef, sourcePayload } = buildSourceIdentity(q);

        // Best-effort dedup to avoid inserting duplicates when rerun.
        const where: any = {
          levelId: globalLevelId,
          sectionCode,
          questionType,
          mondaiId: globalMondaiId,
        };
        if (sourceProvider && sourceRef) {
          where.sourceProvider = sourceProvider;
          where.sourceRef = sourceRef;
        } else if (sourceRef) {
          where.sourceRef = sourceRef;
        } else {
          where.stemText = q.stem_text;
          where.contextText = (q.context_text ?? null) as any;
        }

        const existing = await prisma.jlptQuestionBankQuestion.findFirst({
          where,
          include: { options: true },
        });

        const optionCreates = q.options.map((o, idx) => ({
          key: o.key,
          contentText: o.content_text,
          isCorrect: !!o.is_correct,
          orderIndex: idx,
        }));

        let bankQuestionId: string;
        if (!existing) {
          const created = await prisma.jlptQuestionBankQuestion.create({
            data: {
              levelId: globalLevelId,
              sectionCode,
              mondaiId: globalMondaiId,
              questionType,
              stemText: q.stem_text,
              contextText: q.context_text ?? null,
              explanation: null,
              difficulty,
              sourceProvider,
              sourceRef,
              sourcePayload: sourcePayload ? (sourcePayload as any) : Prisma.DbNull,
              options: { create: optionCreates },
            },
            select: { id: true },
          });
          bankQuestionId = created.id;
          createdBank += 1;
        } else {
          const updated = await prisma.jlptQuestionBankQuestion.update({
            where: { id: existing.id },
            data: {
              sectionCode,
              mondaiId: globalMondaiId,
              questionType,
              stemText: q.stem_text,
              contextText: q.context_text ?? null,
              explanation: null,
              difficulty,
              sourceProvider,
              sourceRef,
              sourcePayload: sourcePayload ? (sourcePayload as any) : Prisma.DbNull,
              options: {
                deleteMany: {},
                create: optionCreates,
              },
            },
            select: { id: true },
          });
          bankQuestionId = updated.id;
          updatedBank += 1;
        }

        await prisma.jlptMockExamTemplateQuestion.upsert({
          where: {
            templateId_orderIndex: {
              templateId,
              orderIndex: orderIndexInLoop,
            },
          },
          create: {
            templateId,
            sectionId: templateSection.id,
            mondaiId: templateMondaiId,
            questionId: bankQuestionId,
            orderIndex: orderIndexInLoop,
            weight: null,
          },
          update: {
            sectionId: templateSection.id,
            mondaiId: templateMondaiId,
            questionId: bankQuestionId,
            weight: null,
          },
        });
        upsertedTplMapping += 1;

        processed += 1;
        if (processed % 50 === 0) {
          console.log(`[progress] processed=${processed}, orderIndex=${orderIndexInLoop}`);
        }
        orderIndexInLoop += 1;
      }
    }

    console.log(
      dry
        ? `[dry-run] done. processed=${processed}`
        : `done. processed=${processed}, createdBank=${createdBank}, updatedBank=${updatedBank}, upsertedTplMapping=${upsertedTplMapping}`,
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

