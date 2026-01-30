import { PrismaClient } from '@prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
}
const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: databaseUrl,
    }),
});

async function main() {
    console.log('Seeding gamification data...');

    // 1. Create Leagues
    const leagues = [
        { name: 'Bronze', orderIndex: 0, minXp: 0, icon: 'Shield' },
        { name: 'Silver', orderIndex: 1, minXp: 500, icon: 'Shield' },
        { name: 'Gold', orderIndex: 2, minXp: 1500, icon: 'Shield' },
        { name: 'Platinum', orderIndex: 3, minXp: 3000, icon: 'Shield' },
        { name: 'Diamond', orderIndex: 4, minXp: 6000, icon: 'Shield' },
    ];

    for (const league of leagues) {
        await prisma.league.upsert({
            where: { name: league.name },
            update: league,
            create: league,
        });
    }

    // 2. Create Shop Items
    const shopItems = [
        {
            code: 'STREAK_FREEZE',
            name: 'Streak Freeze',
            description: 'Bảo vệ chuỗi học tập của bạn nếu bạn bỏ lỡ một ngày.',
            price: 200,
            itemType: 'consume',
            isActive: true,
        },
        {
            code: 'HEART_REFILL',
            name: 'Heart Refill',
            description: 'Hồi phục đầy 5 Tim ngay lập tức để tiếp tục học tập.',
            price: 450,
            itemType: 'consume',
            isActive: true,
        },
        {
            code: 'XP_BOOST',
            name: 'Double XP Boost',
            description: 'Nhận gấp đôi XP cho mọi hành động trong 1 giờ tới.',
            price: 150,
            itemType: 'buff',
            isActive: true,
        },
    ];

    for (const item of shopItems) {
        await prisma.shopItem.upsert({
            where: { code: item.code },
            update: item,
            create: item,
        });
    }

    console.log('Gamification seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
