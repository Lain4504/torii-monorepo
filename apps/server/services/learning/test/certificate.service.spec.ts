import { Test, TestingModule } from '@nestjs/testing';
import { CertificateService } from '@server/learning/modules/certificate/certificate.service';
import {
    CERTIFICATE_REPOSITORY_TOKEN,
    ENROLLMENT_REPOSITORY_TOKEN,
    COURSE_MASTER_REPOSITORY_TOKEN
} from '@server/learning/interfaces/repositories';
import { SharedStorageService } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

// Mock external dependencies
jest.mock('pdf-lib', () => ({
    PDFDocument: {
        create: jest.fn().mockResolvedValue({
            addPage: jest.fn().mockReturnValue({
                getSize: jest.fn().mockReturnValue({ width: 842, height: 595 }),
                drawRectangle: jest.fn(),
                drawLine: jest.fn(),
                drawText: jest.fn(),
                drawImage: jest.fn(),
            }),
            embedFont: jest.fn().mockResolvedValue({
                widthOfTextAtSize: jest.fn().mockReturnValue(100),
            }),
            embedPng: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue(new Uint8Array()),
        }),
    },
    rgb: jest.fn(),
    StandardFonts: {
        HelveticaBold: 'Helvetica-Bold',
        Helvetica: 'Helvetica',
        HelveticaOblique: 'Helvetica-Oblique',
    },
}));

jest.mock('qrcode', () => ({
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('qr-code')),
}));

describe('CertificateService', () => {
    let service: CertificateService;
    let certificateRepository: any;
    let enrollmentRepository: any;
    let courseMasterRepository: any;
    let storageService: any;
    let natsClient: any;
    let mapper: any;

    const mockCertificate = {
        id: 'cert-1',
        certificateCode: 'TORII-CODE',
        fileUrl: 'http://storage.com/cert.pdf',
        userId: 'user-1',
        courseId: 'course-1',
        enrollmentId: 'enr-1',
    };

    const mockCourse = {
        id: 'course-1',
        title: 'Test Course',
    };

    const mockCertificateRepository = {
        count: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findByCode: jest.fn(),
        findByEnrollmentId: jest.fn(),
        create: jest.fn(),
    };

    const mockEnrollmentRepository = {
        findById: jest.fn(),
    };

    const mockCourseMasterRepository = {
        findById: jest.fn(),
    };

    const mockStorageService = {
        upload: jest.fn().mockResolvedValue('http://storage.com/cert.pdf'),
    };

    const mockNatsClient = {
        send: jest.fn(),
        emit: jest.fn(),
    };

    const mockMapper = {
        map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CertificateService,
                {
                    provide: CERTIFICATE_REPOSITORY_TOKEN,
                    useValue: mockCertificateRepository,
                },
                {
                    provide: ENROLLMENT_REPOSITORY_TOKEN,
                    useValue: mockEnrollmentRepository,
                },
                {
                    provide: COURSE_MASTER_REPOSITORY_TOKEN,
                    useValue: mockCourseMasterRepository,
                },
                {
                    provide: SharedStorageService,
                    useValue: mockStorageService,
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: mockNatsClient,
                },
                {
                    provide: getMapperToken(),
                    useValue: mockMapper,
                },
            ],
        }).compile();

        service = module.get<CertificateService>(CertificateService);
        certificateRepository = module.get(CERTIFICATE_REPOSITORY_TOKEN);
        enrollmentRepository = module.get(ENROLLMENT_REPOSITORY_TOKEN);
        courseMasterRepository = module.get(COURSE_MASTER_REPOSITORY_TOKEN);
        storageService = module.get(SharedStorageService);
        natsClient = module.get('NATS_SERVICE');
        mapper = module.get(getMapperToken());

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated certificates', async () => {
            mockCertificateRepository.count.mockResolvedValue(1);
            mockCertificateRepository.findMany.mockResolvedValue([mockCertificate]);

            const result = await service.findAll({ page: '1', limit: '10' });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
    });

    describe('issueCertificate', () => {
        it('should return existing certificate if it exists', async () => {
            mockCertificateRepository.findByEnrollmentId.mockResolvedValue(mockCertificate);

            const result = await service.issueCertificate('user-1', 'course-1', 'enr-1');

            expect(result.id).toBe(mockCertificate.id);
            expect(courseMasterRepository.findById).not.toHaveBeenCalled();
        });

        it('should create and upload new certificate', async () => {
            mockCertificateRepository.findByEnrollmentId.mockResolvedValue(null);
            mockCourseMasterRepository.findById.mockResolvedValue(mockCourse);
            mockNatsClient.send.mockReturnValue(of({ user: { displayName: 'John Doe' } }));
            mockCertificateRepository.create.mockResolvedValue(mockCertificate);

            const result = await service.issueCertificate('user-1', 'course-1', 'enr-1');

            expect(result.id).toBe(mockCertificate.id);
            expect(storageService.upload).toHaveBeenCalled();
            expect(certificateRepository.create).toHaveBeenCalled();
        });

        it('should throw NotFoundException if course not found', async () => {
            mockCertificateRepository.findByEnrollmentId.mockResolvedValue(null);
            mockCourseMasterRepository.findById.mockResolvedValue(null);

            await expect(service.issueCertificate('user-1', 'course-1', 'enr-1'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('verifyCertificate', () => {
        it('should return valid: true if certificate found', async () => {
            mockCertificateRepository.findByCode.mockResolvedValue(mockCertificate);
            const result = await service.verifyCertificate('TORII-CODE');
            expect(result.valid).toBe(true);
            expect(result.certificate?.id).toBe(mockCertificate.id);
        });

        it('should return valid: false if certificate not found', async () => {
            mockCertificateRepository.findByCode.mockResolvedValue(null);
            const result = await service.verifyCertificate('INVALID');
            expect(result.valid).toBe(false);
        });
    });
});
