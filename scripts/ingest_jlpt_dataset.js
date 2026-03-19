#!/usr/bin/env node
/**
 * Ingest JLPT dataset JSON into isolated JLPT tables.
 *
 * Usage examples:
 *   node scripts/ingest_jlpt_dataset.js --exam dataset/jlpt_n5_mock_exam_01.json --publish
 *   node scripts/ingest_jlpt_dataset.js --flat dataset/jlpt_n5_sample_questions.json
 *   node scripts/ingest_jlpt_dataset.js --exam dataset/jlpt_n1_mock_exam_from_csv.json --code N1_MOCK_01 --title "JLPT N1 Mock 01" --publish
 */

const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

function resolvePrismaClient() {
  // Prisma client in this repo is generated as TypeScript under apps/server/generated/prisma.
  // We load it via ts-node (devDependency in apps/server).
  const serverDirCandidates = [
    path.join(process.cwd(), 'apps', 'server'),
    path.join(__dirname, '..', 'apps', 'server'),
    process.cwd(), // if already in apps/server
  ];

  for (const serverDir of serverDirCandidates) {
    const pkgPath = path.join(serverDir, 'package.json');
    const clientTsPath = path.join(serverDir, 'generated', 'prisma', 'client.ts');
    if (!fs.existsSync(pkgPath) || !fs.existsSync(clientTsPath)) continue;

    const req = createRequire(pkgPath);
    try {
      // Load monorepo root .env (same behavior as apps/server/prisma.config.ts)
      // eslint-disable-next-line global-require
      const dotenv = req('dotenv');
      dotenv.config({ path: path.resolve(serverDir, '..', '..', '.env') });

      // eslint-disable-next-line global-require
      req('ts-node/register/transpile-only');
    } catch (e) {
      throw new Error(
        `Cannot load ts-node from ${serverDir}. Please install dependencies in apps/server.`,
      );
    }

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const clientModule = req(clientTsPath);
    const { PrismaPg } = req('@prisma/adapter-pg');
    return { ...clientModule, PrismaPg };
  }

  throw new Error(
    'Cannot resolve Prisma generated client at apps/server/generated/prisma/client.ts',
  );
}

const { PrismaClient, PrismaPg } = resolvePrismaClient();

function parseArgs(argv) {
  const out = { exam: [], flat: [], publish: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--exam') out.exam.push(argv[++i]);
    else if (a === '--flat') out.flat.push(argv[++i]);
    else if (a === '--publish') out.publish = true;
    else if (a === '--code') out.code = argv[++i];
    else if (a === '--title') out.title = argv[++i];
    else if (a === '--scoringProfileId') out.scoringProfileId = argv[++i];
    else if (a === '--dry') out.dry = true;
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out;
}

function mustReadJson(relPath) {
  const abs = path.isAbsolute(relPath)
    ? relPath
    : path.join(process.cwd(), relPath);
  const raw = fs.readFileSync(abs, 'utf-8');
  return JSON.parse(raw);
}

function toLevelCode(level) {
  const x = String(level || '').toUpperCase();
  if (!['N5', 'N4', 'N3', 'N2', 'N1'].includes(x)) {
    throw new Error(`Invalid level: ${level}`);
  }
  return x;
}

function computeTotalMinutes(levelCode) {
  const map = {
    N5: 20 + 40 + 30,
    N4: 25 + 55 + 35,
    N3: 30 + 70 + 40,
    N2: 105 + 50,
    N1: 110 + 55,
  };
  return map[levelCode];
}

async function ensureLevel(prisma, levelCode) {
  const total = computeTotalMinutes(levelCode);
  const existing = await prisma.jlptLevel.findUnique({ where: { code: levelCode } });
  if (existing) return existing;
  return prisma.jlptLevel.create({
    data: {
      code: levelCode,
      totalDurationMinutes: total,
      nameVi: levelCode,
      descriptionVi: `JLPT ${levelCode}`,
    },
  });
}

async function ensureSection(prisma, levelId, code, orderIndex, durationMinutes, isListening) {
  const existing = await prisma.jlptSection.findFirst({
    where: { levelId, code },
  });
  if (existing) return existing;
  return prisma.jlptSection.create({
    data: {
      levelId,
      code,
      nameVi: code,
      durationMinutes,
      orderIndex,
      isListening,
    },
  });
}

async function ensureMondai(prisma, sectionId, code) {
  const existing = await prisma.jlptMondai.findFirst({
    where: { sectionId, code },
  });
  if (existing) return existing;
  return prisma.jlptMondai.create({
    data: {
      sectionId,
      code,
      titleVi: code,
      orderIndex: 0,
    },
  });
}

async function ensureScoringProfile(prisma, levelId, levelCode, requestedId) {
  if (requestedId) {
    const p = await prisma.jlptScoringProfile.findUnique({ where: { id: requestedId } });
    if (!p) throw new Error(`Scoring profile not found: ${requestedId}`);
    if (p.levelId !== levelId) throw new Error(`Scoring profile level mismatch: ${requestedId}`);
    return p;
  }
  // Minimal default profile: no explicit mappings (fallback linear to 0..60),
  // pass rule left null (treated as 0).
  const name = `Default ${levelCode}`;
  const existing = await prisma.jlptScoringProfile.findFirst({
    where: { levelId, name, isActive: true },
  });
  if (existing) return existing;
  return prisma.jlptScoringProfile.create({
    data: {
      levelId,
      name,
      isActive: true,
      minLanguageScaled: 0,
      minReadingScaled: 0,
      minListeningScaled: 0,
      minTotalScaled: 0,
    },
  });
}

async function upsertBankQuestionFromDataset(prisma, level, sectionCode, groupCode, q) {
  const sourceProvider = q?.source?.provider || 'dataset';
  const sourceRef = q?.source?.raw_id != null ? String(q.source.raw_id) : null;

  let existing = null;
  if (sourceRef) {
    existing = await prisma.jlptQuestionBankQuestion.findFirst({
      where: { sourceProvider, sourceRef, sectionCode },
      include: { options: true },
    });
  }

  const data = {
    levelId: level.id,
    sectionCode,
    questionType: q.question_type,
    stemText: q.stem_text,
    contextText: q.context_text ?? null,
    difficulty: q.difficulty || 'EASY',
    explanation: q.explanation ?? null,
    sourceProvider,
    sourceRef,
    sourcePayload: q.source?.raw ? q.source.raw : q.source ?? null,
    mondaiId: null,
  };

  // Mondai mapping by group_code (best-effort)
  if (groupCode) {
    const section = await prisma.jlptSection.findFirst({
      where: { levelId: level.id, code: sectionCode },
      select: { id: true },
    });
    if (section) {
      const mondai = await ensureMondai(prisma, section.id, groupCode);
      data.mondaiId = mondai.id;
    }
  }

  if (!existing) {
    const created = await prisma.jlptQuestionBankQuestion.create({
      data: {
        ...data,
        options: {
          create: (q.options || []).map((o, idx) => ({
            key: o.key,
            contentText: o.content_text,
            isCorrect: !!o.is_correct,
            orderIndex: idx,
          })),
        },
      },
      include: { options: true },
    });
    return created;
  }

  // Update stem/options if payload differs
  const updated = await prisma.jlptQuestionBankQuestion.update({
    where: { id: existing.id },
    data: {
      ...data,
      options: {
        deleteMany: {},
        create: (q.options || []).map((o, idx) => ({
          key: o.key,
          contentText: o.content_text,
          isCorrect: !!o.is_correct,
          orderIndex: idx,
        })),
      },
    },
    include: { options: true },
  });
  return updated;
}

async function ingestExam(prisma, examPath, opts) {
  const payload = mustReadJson(examPath);
  const levelCode = toLevelCode(payload.level);
  const level = await ensureLevel(prisma, levelCode);
  const scoringProfile = await ensureScoringProfile(prisma, level.id, levelCode, opts.scoringProfileId);

  const allowedSectionCodes = new Set([
    'LANGUAGE_VOCAB',
    'LANGUAGE_GRAMMAR_READING',
    'LISTENING',
  ]);

  // Ensure canonical JLPT sections exist for this level (seed)
  // Use official default durations when possible, but do not force-update.
  const sectionSeeds = (() => {
    if (levelCode === 'N5') return [
      ['LANGUAGE_VOCAB', 1, 20, false],
      ['LANGUAGE_GRAMMAR_READING', 2, 40, false],
      ['LISTENING', 3, 30, true],
    ];
    if (levelCode === 'N4') return [
      ['LANGUAGE_VOCAB', 1, 25, false],
      ['LANGUAGE_GRAMMAR_READING', 2, 55, false],
      ['LISTENING', 3, 35, true],
    ];
    if (levelCode === 'N3') return [
      ['LANGUAGE_VOCAB', 1, 30, false],
      ['LANGUAGE_GRAMMAR_READING', 2, 70, false],
      ['LISTENING', 3, 40, true],
    ];
    if (levelCode === 'N2') return [
      ['LANGUAGE_GRAMMAR_READING', 1, 105, false],
      ['LISTENING', 2, 50, true],
    ];
    return [
      ['LANGUAGE_GRAMMAR_READING', 1, 110, false],
      ['LISTENING', 2, 55, true],
    ];
  })();
  for (const [code, orderIndex, durationMinutes, isListening] of sectionSeeds) {
    // eslint-disable-next-line no-await-in-loop
    await ensureSection(prisma, level.id, code, orderIndex, durationMinutes, isListening);
  }

  const templateCode = opts.code || payload.code || `${levelCode}_MOCK_01`;
  const templateTitle = opts.title || payload.title || `JLPT ${levelCode} Mock`;

  const inputSections = (payload.sections || []).filter((s) =>
    allowedSectionCodes.has(s.code),
  );

  const createdTemplate = await prisma.jlptMockExamTemplate.create({
    data: {
      levelId: level.id,
      scoringProfileId: scoringProfile.id,
      code: templateCode,
      title: templateTitle,
      description: payload.description ?? null,
      status: opts.publish ? 'PUBLISHED' : 'DRAFT',
      sections: {
        create: inputSections.map((s) => ({
          code: s.code,
          title: s.title_vi || s.title || s.code,
          durationMinutes: s.duration_minutes,
          orderIndex: s.order_index,
          isListening: s.code === 'LISTENING',
        })),
      },
    },
    include: { sections: true },
  });

  const sectionByCodeOrder = new Map(
    createdTemplate.sections.map((s) => [`${s.code}:${s.orderIndex}`, s]),
  );

  // Ingest questions into bank + attach to template
  let globalOrder = 0;
  for (const section of inputSections) {
    const secRec = sectionByCodeOrder.get(`${section.code}:${section.order_index}`);
    if (!secRec) continue;
    for (const q of section.questions || []) {
      globalOrder += 1;
      // eslint-disable-next-line no-await-in-loop
      const bankQ = await upsertBankQuestionFromDataset(
        prisma,
        level,
        section.code,
        q.group_code,
        q,
      );

      // Ensure template mondai for group_code (optional)
      let templateMondaiId = null;
      if (q.group_code) {
        // eslint-disable-next-line no-await-in-loop
        const existingMondai = await prisma.jlptMockExamMondai.findFirst({
          where: { sectionId: secRec.id, code: q.group_code },
        });
        if (existingMondai) templateMondaiId = existingMondai.id;
        else {
          // eslint-disable-next-line no-await-in-loop
          const createdMondai = await prisma.jlptMockExamMondai.create({
            data: {
              sectionId: secRec.id,
              code: q.group_code,
              titleVi: q.group_code,
              orderIndex: 0,
            },
          });
          templateMondaiId = createdMondai.id;
        }
      }

      // eslint-disable-next-line no-await-in-loop
      await prisma.jlptMockExamTemplateQuestion.create({
        data: {
          templateId: createdTemplate.id,
          sectionId: secRec.id,
          mondaiId: templateMondaiId,
          questionId: bankQ.id,
          orderIndex: globalOrder,
        },
      });
    }
  }

  return createdTemplate;
}

async function ingestFlat(prisma, flatPath) {
  const payload = mustReadJson(flatPath);
  if (!Array.isArray(payload)) throw new Error('Flat payload must be an array');

  let levelCode = null;
  if (payload.length > 0) levelCode = toLevelCode(payload[0].level);
  if (!levelCode) throw new Error('Cannot detect level from flat payload');

  const level = await ensureLevel(prisma, levelCode);

  // Ensure at least canonical sections exist (seed)
  const seeds = levelCode === 'N5'
    ? [['LANGUAGE_VOCAB', 1, 20, false], ['LANGUAGE_GRAMMAR_READING', 2, 40, false], ['LISTENING', 3, 30, true]]
    : levelCode === 'N4'
      ? [['LANGUAGE_VOCAB', 1, 25, false], ['LANGUAGE_GRAMMAR_READING', 2, 55, false], ['LISTENING', 3, 35, true]]
      : levelCode === 'N3'
        ? [['LANGUAGE_VOCAB', 1, 30, false], ['LANGUAGE_GRAMMAR_READING', 2, 70, false], ['LISTENING', 3, 40, true]]
        : levelCode === 'N2'
          ? [['LANGUAGE_GRAMMAR_READING', 1, 105, false], ['LISTENING', 2, 50, true]]
          : [['LANGUAGE_GRAMMAR_READING', 1, 110, false], ['LISTENING', 2, 55, true]];
  for (const [code, orderIndex, durationMinutes, isListening] of seeds) {
    // eslint-disable-next-line no-await-in-loop
    await ensureSection(prisma, level.id, code, orderIndex, durationMinutes, isListening);
  }

  let created = 0;
  for (const q of payload) {
    // eslint-disable-next-line no-await-in-loop
    await upsertBankQuestionFromDataset(
      prisma,
      level,
      q.section_code,
      q.group_code,
      q,
    );
    created += 1;
  }
  return { ok: true, count: created };
}

async function main() {
  const args = parseArgs(process.argv);
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('Missing DATABASE_URL in environment (.env not loaded?)');
  }
  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });
  try {
    if (args.dry) {
      console.log('[DRY] parsed args:', args);
      return;
    }
    for (const p of args.flat) {
      // eslint-disable-next-line no-await-in-loop
      const r = await ingestFlat(prisma, p);
      console.log('Ingested flat:', p, r);
    }
    for (const p of args.exam) {
      // eslint-disable-next-line no-await-in-loop
      const tpl = await ingestExam(prisma, p, args);
      console.log('Ingested exam:', p, { templateId: tpl.id, code: tpl.code, status: tpl.status });
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

