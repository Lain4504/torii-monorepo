/**
 * SUBSCRIPTION PRICING SEED SCRIPT
 * ==================================
 * Mục đích: Khởi tạo các gói đăng ký AI Sensei vào database.
 *
 * Chạy lệnh sau để seed (hoặc cập nhật) giá gói:
 *   cd apps/server
 *   npx ts-node -r tsconfig-paths/register -T prisma/seed-subscriptions.ts
 *
 * ⚠️  LƯU Ý QUAN TRỌNG:
 * Giá gói được lưu ở 2 chỗ và phải cập nhật ĐỒNG BỘ cả 2:
 *
 *  1. DATABASE (file này) — nguồn thật:
 *     Dùng khi checkout, tính tiền, ghi vào lịch sử giao dịch.
 *
 *  2. FRONTEND UI — chỉ để hiển thị:
 *     apps/web-learner/app/(dashboard)/dashboard/payment/subscriptions/page.tsx
 *     const tiers = [{ id: 'plus', price: 50000, ... }, ...]
 *
 * BẢNG GIÁ HIỆN TẠI:
 *   free    = 0đ     (10 lượt/ngày)
 *   plus    = 50,000đ  ~$2  (100 lượt/ngày)
 *   premium = 125,000đ ~$5  (5000 lượt/ngày)
 */

import { PrismaClient, OrderType, OfferingStatus } from '@prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadConfig } from '../libs/shared/src/config/app.config';


const config = loadConfig();
const adapter = new PrismaPg({
    connectionString: config.database.url,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding subscription offerings...');

    // 1. Create a Course Profile for Subscriptions
    const courseProfile = await prisma.courseProfile.upsert({
        where: { code: 'subscriptions' },
        update: {},
        create: {
            code: 'subscriptions',
            title: 'AI Sensei Subscriptions',
            description: 'Tiered access to AI Sensei features',
        },
    });

    const tiers = [
        {
            code: 'free',
            title: 'Free Tier',
            price: 0,
            quota: 10,
        },
        {
            code: 'plus',
            title: 'Plus Tier ($2)',
            price: 50000,
            quota: 100,
        },
        {
            code: 'premium',
            title: 'Premium Tier ($5)',
            price: 125000,
            quota: 5000,
        },
    ];

    for (const tier of tiers) {
        // Create Class for this tier
        const classObj = await prisma.class.upsert({
            where: { code: `class-${tier.code}` },
            update: {},
            create: {
                code: `class-${tier.code}`,
                name: `${tier.title} Access`,
                courseProfileId: courseProfile.id,
                mode: 'VOD',
                status: 'PUBLISHED',
            },
        });

        // Create Offering (1:1 with Class)
        await prisma.courseOffering.upsert({
            where: { code: tier.code },
            update: {
                type: OrderType.SUBSCRIPTION,
                status: OfferingStatus.PUBLISHED,
                metadata: { quotas: { ai_turns: tier.quota } },
                originalPrice: tier.price,
                classId: classObj.id,
                mode: 'VOD',
            },
            create: {
                code: tier.code,
                title: tier.title,
                type: OrderType.SUBSCRIPTION,
                status: OfferingStatus.PUBLISHED,
                originalPrice: tier.price,
                metadata: { quotas: { ai_turns: tier.quota } },
                classId: classObj.id,
                mode: 'VOD',
                price: tier.price,
                currency: 'VND',
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
