/**
 * AI SUBSCRIPTION PLAN SEED SCRIPT
 * ==================================
 * Mục đích: Khởi tạo/cập nhật các gói AI Sensei trong bảng `ai_subscription_plans`.
 *
 * Chạy:
 *   cd apps/server
 *   npx ts-node -r tsconfig-paths/register -T prisma/seed-subscriptions.ts
 */

import { PrismaClient } from '@prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadConfig } from '../libs/shared/src/config/app.config';


const config = loadConfig();
const adapter = new PrismaPg({
    connectionString: config.database.url,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding ai_subscription_plans...');

    const tiers = [
        {
            code: 'free',
            name: 'Free',
            description: 'Gói miễn phí',
            price: 0,
            quota: 10,
            features: [] as string[],
        },
        {
            code: 'plus',
            name: 'Plus',
            description: 'Gói Plus',
            price: 50000,
            quota: 100,
            features: [] as string[],
        },
        {
            code: 'premium',
            name: 'Premium',
            description: 'Gói Premium',
            price: 125000,
            quota: 5000,
            features: [] as string[],
        },
    ];

    for (const tier of tiers) {
        await prisma.aiSubscriptionPlan.upsert({
            where: { code: tier.code },
            update: {
                name: tier.name,
                description: tier.description,
                price: tier.price,
                quotas: { ai_turns: tier.quota } as any,
                features: tier.features,
                isActive: true,
            },
            create: {
                code: tier.code,
                price: tier.price,
                name: tier.name,
                description: tier.description,
                quotas: { ai_turns: tier.quota } as any,
                features: tier.features,
                isActive: true,
            },
        });

        console.log(`✅ Tier [${tier.code}] created/updated.`);
    }

    console.log('✨ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
