import { Test, TestingModule } from '@nestjs/testing';
import { PayOSService } from '../src/modules/payment/payos.service';
import { AppConfigService } from '@server/shared';
import { PayOS } from '@payos/node';
import { BadRequestException } from '@nestjs/common';

// Mock the @payos/node module
jest.mock('@payos/node');

describe('PayOSService', () => {
    let service: PayOSService;
    let mockPayOSInstance: any;

    const mockAppConfigService = {
        thirdParty: {
            payos: {
                clientId: 'test-client-id',
                apiKey: 'test-api-key',
                checksumKey: 'test-checksum-key',
            },
        },
    };

    beforeEach(async () => {
        // Reset the mock PayOS instance for each test
        mockPayOSInstance = {
            createPaymentLink: jest.fn(),
            verifyPaymentWebhookData: jest.fn(),
        };
        (PayOS as unknown as jest.Mock).mockImplementation(() => mockPayOSInstance);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PayOSService,
                { provide: AppConfigService, useValue: mockAppConfigService },
            ],
        }).compile();

        service = module.get<PayOSService>(PayOSService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Initialization', () => {
        it('should initialize PayOS with the correct configuration', () => {
            expect(PayOS).toHaveBeenCalledWith({
                clientId: 'test-client-id',
                apiKey: 'test-api-key',
                checksumKey: 'test-checksum-key',
            });
        });

        it('should handle missing configuration gracefully', async () => {
            const incompleteConfig = {
                thirdParty: {
                    payos: {
                        clientId: null,
                        apiKey: null,
                        checksumKey: null,
                    },
                },
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    PayOSService,
                    { provide: AppConfigService, useValue: incompleteConfig },
                ],
            }).compile();

            const serviceNoConfig = module.get<PayOSService>(PayOSService);

            // Should throw BadRequestException when trying to use PayOS
            await expect(serviceNoConfig.createPaymentLink({} as any)).rejects.toThrow(BadRequestException);
            expect(() => serviceNoConfig.verifyPaymentWebhookData({})).toThrow(BadRequestException);
        });
    });

    describe('createPaymentLink', () => {
        const paymentData = {
            orderCode: 12345678,
            amount: 50000,
            description: 'Test Payment',
            cancelUrl: 'http://localhost:3000/cancel',
            returnUrl: 'http://localhost:3000/success',
        };

        it('should successfully create a payment link', async () => {
            const mockResponse = {
                bin: '123456',
                checkoutUrl: 'https://pay.os/checkout/link',
                accountNumber: '1234567890',
                accountName: 'TEST ACCOUNT',
                amount: 50000,
                description: 'Test Payment',
                orderCode: 12345678,
                status: 'PENDING',
                qrCode: 'qr-code-data',
            };
            mockPayOSInstance.createPaymentLink.mockResolvedValue(mockResponse);

            const result = await service.createPaymentLink(paymentData);

            expect(mockPayOSInstance.createPaymentLink).toHaveBeenCalledWith(paymentData);
            expect(result).toEqual(mockResponse);
        });

        it('should throw BadRequestException when PayOS returns an error', async () => {
            const error = new Error('Invalid amount');
            mockPayOSInstance.createPaymentLink.mockRejectedValue(error);

            await expect(service.createPaymentLink(paymentData)).rejects.toThrow(BadRequestException);
            await expect(service.createPaymentLink(paymentData)).rejects.toThrow('PayOS error: Invalid amount');
        });
    });

    describe('verifyPaymentWebhookData', () => {
        const webhookData = {
            code: '00',
            desc: 'success',
            data: {
                orderCode: 12345678,
                amount: 50000,
                description: 'Test Payment',
                status: 'PAID',
            },
            signature: 'valid-signature',
        };

        it('should successfully verify webhook data', () => {
            mockPayOSInstance.verifyPaymentWebhookData.mockReturnValue(webhookData.data);

            const result = service.verifyPaymentWebhookData(webhookData);

            expect(mockPayOSInstance.verifyPaymentWebhookData).toHaveBeenCalledWith(webhookData);
            expect(result).toEqual(webhookData.data);
        });

        it('should return null or false if signature is invalid (based on PayOS implementation)', () => {
            mockPayOSInstance.verifyPaymentWebhookData.mockReturnValue(null);

            const result = service.verifyPaymentWebhookData(webhookData);

            expect(mockPayOSInstance.verifyPaymentWebhookData).toHaveBeenCalledWith(webhookData);
            expect(result).toBeNull();
        });
    });
});
