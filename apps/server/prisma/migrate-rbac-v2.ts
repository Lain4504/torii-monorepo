import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadConfig } from '../libs/shared/src/config/app.config';

type RbacV2Config = {
  permissions: Array<{ code: string }>;
  role_matrix: Record<string, string[]>;
};

const OLD_TO_NEW: Record<string, string[]> = {
  'academy.content.read': ['lms.catalog.read'],
  'academy.content.write': ['lms.catalog.create', 'lms.catalog.update'],
  'academy.content.approve': ['lms.catalog.approve'],
  'academy.delivery.read': ['lms.delivery.read'],
  'academy.delivery.write': ['lms.delivery.update', 'lms.delivery.attendance.manage'],
  'academy.delivery.approve': ['lms.delivery.approve'],
  'academy.commerce.read': ['lms.commerce.read'],
  'academy.commerce.write': ['lms.commerce.create', 'lms.commerce.update'],
  'academy.commerce.approve': ['lms.commerce.approve'],
  'schedule.view': ['lms.delivery.read'],
  'live_class.manage': ['lms.delivery.manage'],
  'exam.manage': ['lms.assessment.create', 'lms.assessment.update', 'lms.assessment.delete'],
  'submission.grade': ['lms.assessment.grade'],
  'academy:order:admin': ['ops.order.manage'],
  'academy:coupon:admin': ['ops.coupon.manage'],
  'academy:subscription:admin': ['ops.subscription.manage'],
  'blog.manage': ['ops.blog.manage'],
  'blog.create': ['ops.blog.manage'],
  'blog.update': ['ops.blog.manage'],
  'blog.publish': ['ops.blog.manage'],
  'blog.delete': ['ops.blog.manage'],
  'blog.view_restricted': ['ops.blog.manage'],
  'gamification.manage': ['ops.gamification.manage'],
  'support.view': ['ops.support.view'],
  'support.handle': ['ops.support.handle'],
  'user.view': ['ops.user.view'],
  'user.manage': ['ops.user.manage'],
  'report.view': ['ops.report.view'],
  'audit.view': ['ops.audit.view'],
  'system.config': ['ops.user.manage'],
};

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function loadRbacV2Config(): RbacV2Config {
  const configPath = path.join(process.cwd(), 'config', 'rbac-v2.yaml');
  const raw = fs.readFileSync(configPath, 'utf8');
  return yaml.load(raw) as RbacV2Config;
}

async function main() {
  const dryRun = hasFlag('--dry-run') || !hasFlag('--apply');
  const syncFromMatrix = hasFlag('--sync-role-matrix');
  const config = loadConfig();
  const adapter = new PrismaPg({
    connectionString: config.database.url,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const cfg = loadRbacV2Config();
    const validPermissions = new Set(cfg.permissions.map((p) => p.code));
    validPermissions.add('*');

    const rows = await prisma.rolePermission.findMany({
      select: { roleCode: true, permissionCode: true },
      orderBy: [{ roleCode: 'asc' }, { permissionCode: 'asc' }],
    });

    const beforeByRole = new Map<string, Set<string>>();
    for (const r of rows) {
      if (!beforeByRole.has(r.roleCode)) beforeByRole.set(r.roleCode, new Set());
      beforeByRole.get(r.roleCode)!.add(r.permissionCode);
    }

    const afterByRole = new Map<string, Set<string>>();
    for (const [roleCode, perms] of beforeByRole.entries()) {
      const target = new Set<string>();
      for (const oldPerm of perms) {
        if (OLD_TO_NEW[oldPerm]) {
          for (const np of OLD_TO_NEW[oldPerm]) target.add(np);
        } else if (validPermissions.has(oldPerm)) {
          target.add(oldPerm);
        }
      }
      afterByRole.set(roleCode, target);
    }

    if (syncFromMatrix) {
      for (const [roleCode, rolePerms] of Object.entries(cfg.role_matrix || {})) {
        afterByRole.set(roleCode, new Set(rolePerms));
      }
    }

    const before = Object.fromEntries(
      Array.from(beforeByRole.entries()).map(([k, v]) => [k, Array.from(v).sort()]),
    );
    const after = Object.fromEntries(
      Array.from(afterByRole.entries()).map(([k, v]) => [k, Array.from(v).sort()]),
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(
      process.cwd(),
      'prisma',
      `rbac-v2-migration-backup-${timestamp}.json`,
    );
    fs.writeFileSync(
      backupPath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          dryRun,
          syncFromMatrix,
          before,
          after,
        },
        null,
        2,
      ),
      'utf8',
    );

    console.log(`[RBAC V2] Backup written: ${backupPath}`);

    if (dryRun) {
      console.log('[RBAC V2] Dry-run mode: no DB write performed.');
      return;
    }

    await prisma.$transaction(async (tx) => {
      for (const [roleCode, mappedPerms] of afterByRole.entries()) {
        await tx.rolePermission.deleteMany({ where: { roleCode } });
        if (mappedPerms.size > 0) {
          await tx.rolePermission.createMany({
            data: Array.from(mappedPerms).map((permissionCode) => ({
              roleCode,
              permissionCode,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    console.log('[RBAC V2] Migration applied successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[RBAC V2] Migration failed:', err);
  process.exit(1);
});

