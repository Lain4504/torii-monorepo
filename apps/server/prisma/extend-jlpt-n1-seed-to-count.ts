import 'tsconfig-paths/register';

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type SeedQuestionOption = {
  key: string;
  contentText: string;
  isCorrect: boolean;
  orderIndex: number;
};

type SeedQuestion = {
  stemText: string;
  contextText?: string | null;
  orderIndex?: number;
  options: SeedQuestionOption[];
  difficulty?: string;
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
  const out: Record<string, string | undefined> = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--input') out.input = argv[++i];
    else if (a === '--output') out.output = argv[++i];
    else if (a === '--grammarTarget') out.grammarTarget = argv[++i];
    else if (a === '--listeningTarget') out.listeningTarget = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out as {
    input?: string;
    output?: string;
    grammarTarget?: string;
    listeningTarget?: string;
  };
}

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function sectionTotal(section: SeedSection) {
  return section.mondais.reduce((acc, m) => acc + (m.questions?.length ?? 0), 0);
}

async function main() {
  const args = parseArgs(process.argv);
  const inputPath = args.input ?? '../../dataset/n1/n1_seed_combined.json';
  const outputPath = args.output ?? '../../dataset/n1/n1_seed_combined_120.json';
  const grammarTarget = Number(args.grammarTarget ?? 80);
  const listeningTarget = Number(args.listeningTarget ?? 40);

  const raw = readFileSync(resolve(process.cwd(), inputPath), 'utf-8');
  const seed = JSON.parse(raw) as SeedPayload;

  const grammar = seed.sections.find((s) => s.code === 'LANGUAGE_GRAMMAR_READING');
  const listening = seed.sections.find((s) => s.code === 'LISTENING');

  if (!grammar || !listening) {
    throw new Error(
      'Missing required sections: LANGUAGE_GRAMMAR_READING and/or LISTENING in input seed JSON.',
    );
  }

  const ensureSectionToTarget = (section: SeedSection, target: number) => {
    let total = sectionTotal(section);
    if (total >= target) return;

    // Keep mondai order stable.
    const mondais = section.mondais.slice().sort((a, b) => Number(a.orderIndex ?? 0) - Number(b.orderIndex ?? 0));
    section.mondais = mondais;

    // Track max orderIndex per mondai so that sourceRef dedup will create new bank questions.
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
  };

  ensureSectionToTarget(grammar, grammarTarget);
  ensureSectionToTarget(listening, listeningTarget);

  const outTotal = sectionTotal(grammar) + sectionTotal(listening);
  console.log(`[extend] grammar=${sectionTotal(grammar)} listening=${sectionTotal(listening)} total=${outTotal}`);

  writeFileSync(resolve(process.cwd(), outputPath), JSON.stringify(seed, null, 2), 'utf-8');
  console.log(`[extend] wrote: ${outputPath}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

