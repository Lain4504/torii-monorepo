import 'tsconfig-paths/register';

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadConfig } from '@server/shared/config/app.config';
 
function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry') out.dry = true;
    else if (a === '--yes') out.yes = true;
    else if (a === '--level') out.level = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out as { dry?: boolean; yes?: boolean; level?: string };
}
 
async function main() {
  const args = parseArgs(process.argv);
  const levelCode = (args.level ?? 'N1').toUpperCase().trim();
  const dry = !!args.dry;
  const yes = !!args.yes;
 
  if (!dry && !yes) {
    throw new Error('Refusing to run destructive purge without --yes (or use --dry).');
  }
 
  const config = loadConfig();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: config.database.url,
    }),
  });
 
  await prisma.$connect();
 
  try {
    const level = await prisma.jlptLevel.findUnique({
      where: { code: levelCode as any },
      select: { id: true, code: true },
    });
    if (!level) {
      console.log(`[purge] level not found: ${levelCode} (nothing to do)`);
      return;
    }
 
    const templates = await prisma.jlptMockExamTemplate.findMany({
      where: { levelId: level.id },
      select: { id: true, code: true, title: true },
    });
    const templateIds = templates.map((t) => t.id);
 
    console.log(
      `[purge preflight] level=${level.code} levelId=${level.id} templates=${templates.length} dry=${dry}`,
    );
    if (templates.length > 0) {
      console.log(
        `[purge preflight] templateIds=${templateIds.join(', ')}`,
      );
    }
 
    if (dry) return;
 
    // -------------------------
    // 1) Attempts + answers
    // -------------------------
    const deletedAnswers = await prisma.jlptMockAnswer.deleteMany({
      where: {
        attempt: { is: { templateId: { in: templateIds } } },
      },
    });
 
    const deletedAttemptSections = await prisma.jlptMockAttemptSection.deleteMany({
      where: {
        attempt: { is: { templateId: { in: templateIds } } },
      },
    });
 
    const deletedAttempts = await prisma.jlptMockAttempt.deleteMany({
      where: { templateId: { in: templateIds } },
    });
 
    // -------------------------
    // 2) Templates structure
    // -------------------------
    const deletedTemplateQuestions = await prisma.jlptMockExamTemplateQuestion.deleteMany({
      where: { templateId: { in: templateIds } },
    });
 
    const templateSectionIds = (
      await prisma.jlptMockExamSection.findMany({
        where: { templateId: { in: templateIds } },
        select: { id: true },
      })
    ).map((s) => s.id);
 
    const deletedTemplateMondais = await prisma.jlptMockExamMondai.deleteMany({
      where: { sectionId: { in: templateSectionIds } },
    });
 
    const deletedTemplateSections = await prisma.jlptMockExamSection.deleteMany({
      where: { templateId: { in: templateIds } },
    });
 
    const deletedTemplates = await prisma.jlptMockExamTemplate.deleteMany({
      where: { levelId: level.id },
    });
 
    // -------------------------
    // 3) Question bank (level-scoped)
    // -------------------------
    // Delete bank questions for this level (options cascade).
    const deletedBankQuestions = await prisma.jlptQuestionBankQuestion.deleteMany({
      where: { levelId: level.id },
    });
 
    // -------------------------
    // 4) Global structure (sections/mondai/scoring/level)
    // -------------------------
    // Mondai under sections will cascade on section delete, but nullify refs already since bank questions were deleted.
    const deletedSections = await prisma.jlptSection.deleteMany({
      where: { levelId: level.id },
    });
 
    // Scoring profiles are level-scoped; mappings cascade.
    const deletedScoringProfiles = await prisma.jlptScoringProfile.deleteMany({
      where: { levelId: level.id },
    });
 
    const deletedLevel = await prisma.jlptLevel.deleteMany({
      where: { id: level.id },
    });
 
    console.log(
      JSON.stringify(
        {
          ok: true,
          level: level.code,
          deleted: {
            answers: deletedAnswers.count,
            attemptSections: deletedAttemptSections.count,
            attempts: deletedAttempts.count,
            templateQuestions: deletedTemplateQuestions.count,
            templateMondais: deletedTemplateMondais.count,
            templateSections: deletedTemplateSections.count,
            templates: deletedTemplates.count,
            bankQuestions: deletedBankQuestions.count,
            sections: deletedSections.count,
            scoringProfiles: deletedScoringProfiles.count,
            levels: deletedLevel.count,
          },
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

