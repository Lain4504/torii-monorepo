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

function byOrderIndex(a: any, b: any) {
  return Number(a?.orderIndex ?? 0) - Number(b?.orderIndex ?? 0);
}

async function main() {
  const outPath = process.argv[2] ?? '../../dataset/n1/n1_seed_combined.json';
  const part1Path = process.argv[3] ?? '../../dataset/n1/part1.json';
  const part2Path = process.argv[4] ?? '../../dataset/n1/part2.json';
  const part3Path = process.argv[5] ?? '../../dataset/n1/part3.json';

  const p1 = JSON.parse(readFileSync(resolve(process.cwd(), part1Path), 'utf-8')) as PartPayload;
  const p2 = JSON.parse(readFileSync(resolve(process.cwd(), part2Path), 'utf-8')) as PartPayload;
  const p3 = JSON.parse(readFileSync(resolve(process.cwd(), part3Path), 'utf-8')) as PartPayload;

  const examTitle = [p1.examTitle, p2.examTitle, p3.examTitle].filter(Boolean).join(' | ');

  const sectionsMap = new Map<
    string,
    { durationMinutes: number; mondais: Array<any> }
  >();

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

  const sections = Array.from(sectionsMap.entries())
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

  // seed-jlpt-template-specific.ts expects NestedDataset:
  // { levelCode?, sections: [{ code, durationMinutes?, mondais: [{ mondaiCode, questions: [...] }] }] }
  const out = {
    levelCode: p1.levelCode ?? 'N1',
    examTitle,
    sections,
  };

  writeFileSync(resolve(process.cwd(), outPath), JSON.stringify(out, null, 2), 'utf-8');
  console.log(`[build] wrote: ${outPath}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

