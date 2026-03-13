/**
 * AI SUBSCRIPTION PLANS SEED SCRIPT
 * 
 * Cách chạy:
 * 1. Mở terminal tại thư mục: apps/server
 * 2. Chạy lệnh: npx ts-node prisma/seed-ai-plans.ts
 * 
 * Tác dụng:
 * - Khởi tạo 3 gói cước mặc định: Free, Plus, Premium vào Database.
 * - Sử dụng 'upsert' nên có thể chạy nhiều lần để cập nhật thông tin mà không sợ trùng dữ liệu.
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
    console.log('🌱 Seeding AI Subscription Plans...');

    const plans = [
        {
            code: 'free',
            name: 'Gói Miễn Phí',
            description: 'Trải nghiệm AI Sensei cơ bản.',
            price: 0,
            features: ['10 lượt chat/ngày', 'Phát âm cơ bản', 'Lưu lịch sử hội thoại'],
            quotas: { ai_turns: 10 }
        },
        {
            code: 'plus',
            name: 'Gói Plus',
            description: 'Mở rộng khả năng học tập với nhiều lượt chat hơn.',
            price: 50000,
            features: ['100 lượt chat/ngày', 'Ưu tiên phản hồi', 'Phân tích ngữ pháp nâng cao', 'Luyện nghe với giọng đọc tự nhiên'],
            quotas: { ai_turns: 100 }
        },
        {
            code: 'premium',
            name: 'Gói Premium',
            description: 'Tận hưởng toàn bộ sức mạnh của AI không giới hạn.',
            price: 125000,
            features: ['5000 lượt chat/ngày (Gần như không giới hạn)', 'Sensei riêng biệt 24/7', 'Phân tích phát âm AI chuyên sâu', 'Tất cả tính năng mới cập nhật sớm nhất'],
            quotas: { ai_turns: 5000 }
        }
    ];

    for (const plan of plans) {
        await prisma.aiSubscriptionPlan.upsert({
            where: { code: plan.code },
            update: {
                name: plan.name,
                description: plan.description,
                price: plan.price,
                features: plan.features,
                quotas: plan.quotas,
            },
            create: {
                code: plan.code,
                name: plan.name,
                description: plan.description,
                price: plan.price,
                features: plan.features,
                quotas: plan.quotas,
            }
        });
        console.log(`✅ Plan [${plan.code}] seeded.`);
    }

    console.log('✨ AI Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
