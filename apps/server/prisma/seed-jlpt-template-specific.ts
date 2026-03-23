import 'tsconfig-paths/register';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient, Prisma } from '../generated/prisma/client';
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
  examTitle?: string;
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

type PartSection = {
  sectionCode: string;
  durationMinutes?: number;
  orderIndex?: number;
  mondais?: Array<any>;
};

type PartPayload = {
  levelCode?: string;
  examTitle?: string;
  sections?: PartSection[];
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
    else if (a === '--inputPart1') out.inputPart1 = argv[++i];
    else if (a === '--inputPart2') out.inputPart2 = argv[++i];
    else if (a === '--inputPart3') out.inputPart3 = argv[++i];
    else if (a === '--grammarTarget') out.grammarTarget = argv[++i];
    else if (a === '--listeningTarget') out.listeningTarget = argv[++i];
    else if (a === '--take') out.take = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out as {
    dry?: boolean;
    mode?: 'append' | 'replace';
    templateId?: string;
    sectionCode?: JlptSectionCode;
    input?: string;
    inputPart1?: string;
    inputPart2?: string;
    inputPart3?: string;
    grammarTarget?: string;
    listeningTarget?: string;
    take?: string;
  };
}

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function sectionTotal(section: { mondais?: Array<{ questions?: any[] }> }) {
  return (section.mondais ?? []).reduce((acc, m) => acc + (m.questions?.length ?? 0), 0);
}

function ensureSectionToTarget(section: any, target: number) {
  let total = sectionTotal(section);
  if (total >= target) return;

  const mondais = (section.mondais ?? []).slice().sort((a, b) => Number(a?.orderIndex ?? 0) - Number(b?.orderIndex ?? 0));
  section.mondais = mondais;

  const maxOrderByMondai = new Map<string, number>();
  for (const m of section.mondais) {
    const max = (m.questions ?? []).reduce((acc: number, q: any) => Math.max(acc, Number(q.orderIndex ?? 0)), 0);
    maxOrderByMondai.set(m.mondaiCode, max);
  }

  let mondaiPtr = 0;
  let qPtr = 0;

  while (total < target) {
    const m = section.mondais[mondaiPtr % section.mondais.length];
    const pool = m.questions ?? [];
    if (pool.length === 0) {
      mondaiPtr += 1;
      continue;
    }

    const src = pool[qPtr % pool.length];
    const cloned = deepClone(src);

    const curMax = maxOrderByMondai.get(m.mondaiCode) ?? 0;
    const nextOrder = curMax + 1;
    maxOrderByMondai.set(m.mondaiCode, nextOrder);

    cloned.orderIndex = nextOrder;
    cloned.options = (cloned.options ?? []).map((o: any, idx: number) => ({
      ...o,
      orderIndex: o.orderIndex ?? idx,
    }));

    m.questions.push(cloned);
    total += 1;
    qPtr += 1;
    mondaiPtr += 1;
  }
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
  if (code.includes('_L_') || code.includes('LISTEN') || code.includes('LISTENING')) return 'LISTENING';
  return 'VOCAB';
}

function inferQuestionTypeFromMondaiTitles(input: {
  sectionCode: JlptSectionCode;
  mondaiCode: string;
  titleJa?: string | null;
  titleVi?: string | null;
}): JlptQuestionType {
  const { sectionCode, mondaiCode, titleJa, titleVi } = input;
  if (sectionCode === 'LISTENING') return 'LISTENING';

  const base: JlptQuestionType = sectionCode === 'LANGUAGE_VOCAB' ? 'VOCAB' : 'GRAMMAR';
  const raw = `${mondaiCode ?? ''}\n${titleJa ?? ''}\n${titleVi ?? ''}`;

  // 読解
  if (
    /読解|内容理解|統合理解|主張理解|情報検索|長文|中文|短文|DOCKAI|DOKKAI|NATTOKU|JYOUHOU|CHUUBUN|CHUBUN|TOKU|RYOUKAI/i.test(
      raw,
    )
  ) {
    return 'READING';
  }

  // 文法
  if (/文法|文の文法|文章の文法|BUNPO|BUN_NO|GRAMMAR/i.test(raw)) {
    return 'GRAMMAR';
  }

  // 語彙・漢字
  if (/漢字|語彙|表記|文脈|言い換え|用法|GOI|KANJI|HYOUKI/i.test(raw)) {
    return 'VOCAB';
  }

  // Fallback: keep previous code-based heuristic.
  return inferQuestionTypeFromMondaiCode(mondaiCode) ?? base;
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
  const dry = !!args.dry;
  const mode = args.mode ?? 'append';
  const take = args.take ? Number(args.take) : undefined;
  const takeInt = take != null ? Math.max(1, take) : undefined;

  const hasParts =
    !!args.inputPart1 && !!args.inputPart2 && !!args.inputPart3;

  let dataset: Dataset | NestedDataset;
  if (hasParts) {
    const inputPart1 = args.inputPart1 ?? '../../dataset/n1/part1.json';
    const inputPart2 = args.inputPart2 ?? '../../dataset/n1/part2.json';
    const inputPart3 = args.inputPart3 ?? '../../dataset/n1/part3.json';

    const grammarTarget = Number(args.grammarTarget ?? 80);
    const listeningTarget = Number(args.listeningTarget ?? 40);

    const raw1 = readFileSync(resolve(process.cwd(), inputPart1), 'utf-8');
    const raw2 = readFileSync(resolve(process.cwd(), inputPart2), 'utf-8');
    const raw3 = readFileSync(resolve(process.cwd(), inputPart3), 'utf-8');

    const p1 = JSON.parse(raw1) as PartPayload;
    const p2 = JSON.parse(raw2) as PartPayload;
    const p3 = JSON.parse(raw3) as PartPayload;

    const examTitle = [p1.examTitle, p2.examTitle, p3.examTitle].filter(Boolean).join(' | ');

    const sectionsMap = new Map<string, { durationMinutes: number; mondais: Array<any> }>();
    const pushParts = (p: PartPayload) => {
      for (const s of p.sections ?? []) {
        const code = String(s.sectionCode);
        const durationMinutes = Number(s.durationMinutes ?? 0) || 0;
        const existing = sectionsMap.get(code);
        if (!existing) {
          sectionsMap.set(code, { durationMinutes, mondais: [...(s.mondais ?? [])] });
        } else {
          existing.durationMinutes = existing.durationMinutes || durationMinutes;
          existing.mondais.push(...(s.mondais ?? []));
        }
      }
    };

    pushParts(p1);
    pushParts(p2);
    pushParts(p3);

    const combined: NestedDataset = {
      levelCode: p1.levelCode ?? 'N1',
      examTitle,
      sections: Array.from(sectionsMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([code, v]) => {
          const orderIndex = code === 'LANGUAGE_GRAMMAR_READING' ? 1 : code === 'LISTENING' ? 2 : 1;
          return {
            code,
            durationMinutes: v.durationMinutes,
            orderIndex,
            mondais: v.mondais.slice().sort((a, b) => Number(a?.orderIndex ?? 0) - Number(b?.orderIndex ?? 0)),
          };
        }),
    };

    const grammar = (combined.sections as any).find((s: any) => s.code === 'LANGUAGE_GRAMMAR_READING');
    const listening = (combined.sections as any).find((s: any) => s.code === 'LISTENING');
    if (!grammar || !listening) {
      throw new Error('Missing required parts sections: LANGUAGE_GRAMMAR_READING and/or LISTENING');
    }

    ensureSectionToTarget(grammar, grammarTarget);
    ensureSectionToTarget(listening, listeningTarget);

    dataset = combined;
  } else {
    throw new Error(
      'Legacy dataset input is disabled for JLPT N1 seeding. Please provide --inputPart1/--inputPart2/--inputPart3.',
    );
  }

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
        const titleVi = (m.titleVi ?? mondaiCode) as string;
        const titleJa = m.titleJa ?? null;
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

          const inferredType = inferQuestionTypeFromMondaiTitles({
            sectionCode,
            mondaiCode,
            titleJa,
            titleVi,
          });
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
              // TemplateQuestion.mondaiId references global `JlptMondai` (not `JlptMockExamMondai`)
              mondaiId: globalMondaiId,
              questionId: bankQuestionId,
              orderIndex: orderIndexInLoop,
              weight: null,
            },
            update: {
              sectionId: templateSection.id,
              mondaiId: globalMondaiId,
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
            // TemplateQuestion.mondaiId references global `JlptMondai` (not `JlptMockExamMondai`)
            mondaiId: globalMondaiId,
            questionId: bankQuestionId,
            orderIndex: orderIndexInLoop,
            weight: null,
          },
          update: {
            sectionId: templateSection.id,
            mondaiId: globalMondaiId,
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

