import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from '../src/modules/report/report.service';
import { PrismaService } from '@server/shared';
import * as ExcelJS from 'exceljs';

// Mock ExcelJS
jest.mock('exceljs', () => {
    const mockSheet = {
        addRow: jest.fn(),
        getRow: jest.fn().mockReturnValue({
            font: {},
            fill: {},
        }),
        columns: [],
    };
    const mockWorkbook = {
        addWorksheet: jest.fn().mockReturnValue(mockSheet),
        xlsx: {
            writeBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-excel-buffer')),
        },
    };
    return {
        Workbook: jest.fn().mockImplementation(() => mockWorkbook),
    };
});

describe('ReportService', () => {
    let service: ReportService;
    let prisma: PrismaService;

    const mockPrismaService = {
        order: {
            findMany: jest.fn(),
        },
        balanceTransaction: {
            findMany: jest.fn(),
        },
        course: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ReportService>(ReportService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('exportOrders', () => {
        it('should export orders to excel buffer', async () => {
            const mockOrders = [
                {
                    id: 'order-1',
                    amount: 50000,
                    currency: 'VND',
                    orderType: 'course_purchase',
                    paymentMethod: 'payos',
                    completedAt: new Date(),
                    user: { displayName: 'User 1', email: 'user1@example.com' },
                },
            ];
            mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

            const result = await service.exportOrders({ startDate: '2024-01-01' });

            expect(prisma.order.findMany).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Buffer);
            expect(result.toString()).toBe('mock-excel-buffer');
        });

        it('should handle orders with missing user information', async () => {
            const mockOrders = [
                {
                    id: 'order-2',
                    amount: 100000,
                    currency: 'VND',
                    orderType: 'deposit',
                    paymentMethod: 'momo',
                    completedAt: null,
                    user: null,
                },
            ];
            mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

            const result = await service.exportOrders({});

            expect(prisma.order.findMany).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Buffer);
        });
    });

    describe('exportBalanceHistory', () => {
        it('should export balance transactions to excel buffer', async () => {
            const mockTransactions = [
                {
                    id: 'tx-1',
                    amount: 100,
                    type: 'plus',
                    description: 'Daily reward',
                    createdAt: new Date(),
                    user: { displayName: 'User 1', email: 'user1@example.com' },
                },
            ];
            mockPrismaService.balanceTransaction.findMany.mockResolvedValue(mockTransactions);

            const result = await service.exportBalanceHistory({ endDate: '2024-12-31' });

            expect(prisma.balanceTransaction.findMany).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Buffer);
        });
    });

    describe('exportCourseRevenue', () => {
        it('should export course revenue to excel buffer', async () => {
            const mockCourses = [
                {
                    title: 'N5 Course',
                    jlptLevel: 'N5',
                    enrollments: [
                        {
                            order: {
                                status: 'completed',
                                amount: 50000,
                                paymentMethod: 'payos',
                            },
                        },
                        {
                            order: {
                                status: 'completed',
                                amount: 100,
                                paymentMethod: 'coin',
                            },
                        },
                        {
                            order: {
                                status: 'pending',
                                amount: 50000,
                                paymentMethod: 'payos',
                            },
                        },
                    ],
                },
            ];
            mockPrismaService.course.findMany.mockResolvedValue(mockCourses);

            const result = await service.exportCourseRevenue();

            expect(prisma.course.findMany).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Buffer);
        });
    });
});
