import 'tsconfig-paths/register';

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type PartSection = {
  sectionCode: string;
  durationMinutes?: number;
  mondais?: Array<any>;
};

type PartPayload = {
  levelCode?: string;
  examTitle?: string;
  sections?: PartSection[];
};

type SeedQuestionOption = {
  key: string;
  contentText: string;
  isCorrect: boolean;
  orderIndex?: number;
};

type SeedQuestion = {
  stemText: string;
  contextText?: string | null;
  orderIndex?: number;
  options: SeedQuestionOption[];
  explanation?: string | null;
  difficulty?: string;
  questionType?: string;
};

type SeedMondai = {
  mondaiCode: string;
  titleJa?: string | null;
  titleVi?: string | null;
  orderIndex?: number;
  questions: SeedQuestion[];
};

type SeedSection = {
  code: string;
  durationMinutes?: number;
  orderIndex?: number;
  mondais: SeedMondai[];
};

type SeedPayload = {
  levelCode?: string;
  examTitle?: string;
  sections: SeedSection[];
};

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--grammarTarget') out.grammarTarget = argv[++i];
    else if (a === '--listeningTarget') out.listeningTarget = argv[++i];
    else if (a === '--inputPart1') out.inputPart1 = argv[++i];
    else if (a === '--inputPart2') out.inputPart2 = argv[++i];
    else if (a === '--inputPart3') out.inputPart3 = argv[++i];
    else if (a === '--outputCombined') out.outputCombined = argv[++i];
    else if (a === '--outputFinal') out.outputFinal = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out as {
    grammarTarget?: string;
    listeningTarget?: string;
    inputPart1?: string;
    inputPart2?: string;
    inputPart3?: string;
    outputCombined?: string;
    outputFinal?: string;
  };
}

function byOrderIndex(a: any, b: any) {
  return Number(a?.orderIndex ?? 0) - Number(b?.orderIndex ?? 0);
}

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function sectionTotal(section: SeedSection) {
  return (section.mondais ?? []).reduce((acc, m) => acc + (m.questions?.length ?? 0), 0);
}

function ensureSectionToTarget(section: SeedSection, target: number) {
  let total = sectionTotal(section);
  if (total >= target) return;

  // Keep mondai order stable.
  const mondais = section.mondais.slice().sort((a, b) => Number(a.orderIndex ?? 0) - Number(b.orderIndex ?? 0));
  section.mondais = mondais;

  // Track max orderIndex per mondai.
  const maxOrderByMondai = new Map<string, number>();
  for (const m of section.mondais) {
    const max = (m.questions ?? []).reduce((acc, q) => Math.max(acc, Number(q.orderIndex ?? 0)), 0);
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

    // Ensure options have deterministic orderIndex.
    cloned.options = (cloned.options ?? []).map((o, idx) => ({
      ...o,
      orderIndex: o.orderIndex ?? idx,
    }));

    m.questions.push(cloned);
    total += 1;

    qPtr += 1;
    mondaiPtr += 1;
  }
}

async function main() {
  const args = parseArgs(process.argv);

  const inputPart1 = args.inputPart1 ?? '../../dataset/n1/part1.json';
  const inputPart2 = args.inputPart2 ?? '../../dataset/n1/part2.json';
  const inputPart3 = args.inputPart3 ?? '../../dataset/n1/part3.json';

  const outputCombined = args.outputCombined ?? '../../dataset/n1/n1_seed_combined.json';
  const outputFinal = args.outputFinal ?? '../../dataset/n1/n1_seed_combined_120.json';

  const grammarTarget = Number(args.grammarTarget ?? 80);
  const listeningTarget = Number(args.listeningTarget ?? 40);

  const p1 = JSON.parse(readFileSync(resolve(process.cwd(), inputPart1), 'utf-8')) as PartPayload;
  const p2 = JSON.parse(readFileSync(resolve(process.cwd(), inputPart2), 'utf-8')) as PartPayload;
  const p3 = JSON.parse(readFileSync(resolve(process.cwd(), inputPart3), 'utf-8')) as PartPayload;

  const examTitle = [p1.examTitle, p2.examTitle, p3.examTitle].filter(Boolean).join(' | ');

  const sectionsMap = new Map<string, { durationMinutes: number; mondais: Array<any> }>();
  const pushParts = (p: PartPayload) => {
    for (const s of p.sections ?? []) {
      const sectionCode = String(s.sectionCode);
      const durationMinutes = Number(s.durationMinutes ?? 0) || 0;
      const existing = sectionsMap.get(sectionCode);
      if (!existing) {
        sectionsMap.set(sectionCode, { durationMinutes, mondais: [...(s.mondais ?? [])] });
      } else {
        existing.durationMinutes = existing.durationMinutes || durationMinutes;
        existing.mondais.push(...(s.mondais ?? []));
      }
    }
  };

  pushParts(p1);
  pushParts(p2);
  pushParts(p3);

  const sections: SeedSection[] = Array.from(sectionsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sectionCode, v]) => {
      const orderIndex = sectionCode === 'LANGUAGE_GRAMMAR_READING' ? 1 : sectionCode === 'LISTENING' ? 2 : 1;
      return {
        code: sectionCode,
        durationMinutes: v.durationMinutes,
        orderIndex,
        mondais: v.mondais.slice().sort(byOrderIndex),
      };
    });

  const seedBase: SeedPayload = {
    levelCode: p1.levelCode ?? 'N1',
    examTitle,
    sections,
  };

  writeFileSync(resolve(process.cwd(), outputCombined), JSON.stringify(seedBase, null, 2), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`[dataset] wrote combined: ${outputCombined}`);

  const grammar = seedBase.sections.find((s) => s.code === 'LANGUAGE_GRAMMAR_READING');
  const listening = seedBase.sections.find((s) => s.code === 'LISTENING');
  if (!grammar || !listening) {
    throw new Error('Missing required sections in parts: LANGUAGE_GRAMMAR_READING and/or LISTENING');
  }

  ensureSectionToTarget(grammar, grammarTarget);
  ensureSectionToTarget(listening, listeningTarget);

  const outTotal = sectionTotal(grammar) + sectionTotal(listening);
  // eslint-disable-next-line no-console
  console.log(`[dataset] target grammar=${grammarTarget} listening=${listeningTarget} total=${outTotal}`);

  writeFileSync(resolve(process.cwd(), outputFinal), JSON.stringify(seedBase, null, 2), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`[dataset] wrote final: ${outputFinal}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

