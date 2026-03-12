/**
 * SUBSCRIPTION PRICING SEED SCRIPT
 * ==================================
 * Mục đích: Khởi tạo các gói đăng ký AI Sensei vào bảng `ai_subscription_plans`.
 *
 * Chạy lệnh sau để seed (hoặc cập nhật) giá gói:
 *   cd apps/server
 *   npx ts-node -r tsconfig-paths/register -T prisma/seed-subscriptions.ts
 *
 * ⚠️  LƯU Ý QUAN TRỌNG:
 * Giá gói được lưu ở 2 chỗ và phải cập nhật ĐỒNG BỘ cả 2:
 *
 *  1. DATABASE (file này) — nguồn thật:
 *     Bảng `ai_subscription_plans` - dùng khi checkout, tính tiền, ghi vào lịch sử giao dịch.
 *
 *  2. FRONTEND UI — chỉ để hiển thị (sẽ fetch từ API sau khi hoàn chỉnh):
 *     apps/web-learner/app/(dashboard)/dashboard/payment/subscriptions/page.tsx
 *
 * BẢNG GIÁ HIỆN TẠI:
 *   free    = 0đ          (10 lượt/ngày)
 *   plus    = 50,000đ ~$2  (100 lượt/ngày)
 *   premium = 125,000đ ~$5 (5000 lượt/ngày)
 */

import { PrismaClient } from '@prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadConfig } from '../libs/shared/src/config/app.config';

const config = loadConfig();
const adapter = new PrismaPg({
    connectionString: config.database.url,
});
const prisma = new PrismaClient({ adapter });

const plans = [
    {
        code: 'free',
        name: 'Free',
        description: 'Dành cho người mới bắt đầu khám phá AI Sensei.',
        price: 0,
        billingCycle: 'LIFETIME' as const,
        quotas: { ai_turns: 10 },
        features: [
            '10 lượt check ngữ pháp/ngày',
            '10 lượt dịch thuật/ngày',
            'Truy cập cơ bản AI Sensei Chat',
            'Hỗ trợ qua cộng đồng',
        ],
        sortOrder: 0,
    },
    {
        code: 'plus',
        name: 'Plus',
        description: 'Gói phổ biến nhất cho người học nghiêm túc.',
        price: 50000,
        billingCycle: 'MONTHLY' as const,
        quotas: { ai_turns: 100 },
        features: [
            '100 lượt sử dụng AI mỗi ngày',
            'Không giới hạn dịch thuật',
            'Truy cập đầy đủ Roleplay & Voice',
            'Ưu tiên phản hồi từ AI',
            'Hỗ trợ ưu tiên',
        ],
        sortOrder: 1,
    },
    {
        code: 'premium',
        name: 'Premium',
        description: 'Trải nghiệm không giới hạn cùng AI Sensei.',
        price: 125000,
        billingCycle: 'MONTHLY' as const,
        quotas: { ai_turns: 5000 },
        features: [
            '5000 lượt (Gần như vô hạn) mỗi ngày',
            'Mọi tính năng AI Sensei mới nhất',
            'Giao diện không quảng cáo',
            'Tùy chỉnh giọng nói AI',
            'Hỗ trợ 1-1 chuyên sâu',
        ],
        sortOrder: 2,
    },
];

async function main() {
    console.log('🌱 Seeding AI subscription plans...');

    for (const plan of plans) {
        await prisma.aiSubscriptionPlan.upsert({
            where: { code: plan.code },
            create: {
                code: plan.code,
                name: plan.name,
                description: plan.description,
                price: plan.price,
                billingCycle: plan.billingCycle,
                quotas: plan.quotas,
                features: plan.features,
                sortOrder: plan.sortOrder,
                isActive: true,
            },
            update: {
                name: plan.name,
                description: plan.description,
                price: plan.price,
                billingCycle: plan.billingCycle,
                quotas: plan.quotas,
                features: plan.features,
                sortOrder: plan.sortOrder,
                isActive: true,
            },
        });

        console.log(`✅ Plan [${plan.code}] upserted (${plan.price}đ)`);
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
