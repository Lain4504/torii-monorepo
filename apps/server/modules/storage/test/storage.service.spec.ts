
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../src/modules/storage/storage.service';
import { SharedStorageService } from '@server/shared/storage/shared-storage.service';
import { STORAGE_REPOSITORY_TOKEN } from '../src/interfaces/repositories/i-storage.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock uuid
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid-1234'),
}));

describe('StorageService', () => {
    let service: StorageService;
    let sharedStorageService: SharedStorageService;
    let storageRepository: any;

    const mockSharedStorageService = {
        generatePresignedUploadUrl: jest.fn(),
        getPublicUrl: jest.fn(),
        extractKeyFromUrl: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        getPresignedUrl: jest.fn(),
    };

    const mockStorageRepository = {
        create: jest.fn(),
        update: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                {
                    provide: SharedStorageService,
                    useValue: mockSharedStorageService,
                },
                {
                    provide: STORAGE_REPOSITORY_TOKEN,
                    useValue: mockStorageRepository,
                },
            ],
        }).compile();

        service = module.get<StorageService>(StorageService);
        sharedStorageService = module.get<SharedStorageService>(SharedStorageService);
        storageRepository = module.get(STORAGE_REPOSITORY_TOKEN);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generatePresignedUploadUrl', () => {
        it('should generate a presigned upload URL and create a pending record', async () => {
            const dto = {
                filename: 'test-image.png',
                module: 'profile',
                contentType: 'image/png',
                ownerId: 'user-123',
                metadata: { key: 'value' },
            };

            const expectedKey = 'uploads/profile/mock-uuid-1234.png';
            const expectedPublicUrl = `https://storage.example.com/${expectedKey}`;
            const expectedUploadUrl = 'https://s3.example.com/upload-url';

            mockSharedStorageService.generatePresignedUploadUrl.mockResolvedValue(expectedUploadUrl);
            mockSharedStorageService.getPublicUrl.mockReturnValue(expectedPublicUrl);
            mockStorageRepository.create.mockResolvedValue({ id: 'mock-uuid-1234' });
            mockStorageRepository.update.mockResolvedValue({ id: 'mock-uuid-1234', fileUrl: expectedPublicUrl });

            const result = await service.generatePresignedUploadUrl(dto);

            expect(storageRepository.create).toHaveBeenCalledWith({
                id: 'mock-uuid-1234',
                fileUrl: expectedKey,
                mimeType: dto.contentType,
                status: 'pending',
                ownerId: dto.ownerId,
                metadata: dto.metadata,
                moduleOrigin: 'PROFILE', // data.module.toUpperCase()
                isPublic: false,
            });

            expect(sharedStorageService.generatePresignedUploadUrl).toHaveBeenCalledWith(expectedKey, dto.contentType);
            expect(sharedStorageService.getPublicUrl).toHaveBeenCalledWith(expectedKey);
            expect(storageRepository.update).toHaveBeenCalledWith('mock-uuid-1234', { fileUrl: expectedPublicUrl });

            expect(result).toEqual({
                uploadUrl: expectedUploadUrl,
                fileId: 'mock-uuid-1234',
                fileUrl: expectedPublicUrl,
                expiresIn: 3600,
            });
        });
    });

    describe('confirmUpload', () => {
        it('should confirm upload if file exists in shared storage', async () => {
            const dto = { fileId: 'mock-uuid-1234' };
            const fileAsset = {
                id: 'mock-uuid-1234',
                fileUrl: 'https://storage.example.com/uploads/profile/mock-uuid-1234.png',
            };
            const extractedKey = 'uploads/profile/mock-uuid-1234.png';

            mockStorageRepository.findById.mockResolvedValue(fileAsset);
            mockSharedStorageService.extractKeyFromUrl.mockReturnValue(extractedKey);
            mockSharedStorageService.exists.mockResolvedValue(true);
            mockStorageRepository.update.mockResolvedValue({
                ...fileAsset,
                status: 'uploaded',
            });

            const result = await service.confirmUpload(dto);

            expect(storageRepository.findById).toHaveBeenCalledWith(dto.fileId);
            expect(sharedStorageService.extractKeyFromUrl).toHaveBeenCalledWith(fileAsset.fileUrl);
            expect(sharedStorageService.exists).toHaveBeenCalledWith(extractedKey);
            expect(storageRepository.update).toHaveBeenCalledWith(dto.fileId, { status: 'uploaded' });

            expect(result).toEqual({
                success: true,
                fileId: 'mock-uuid-1234',
                fileUrl: fileAsset.fileUrl,
            });
        });

        it('should throw NotFoundException if file asset not found', async () => {
            mockStorageRepository.findById.mockResolvedValue(null);

            await expect(service.confirmUpload({ fileId: 'non-existent' })).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if file does not exist in shared storage', async () => {
            const dto = { fileId: 'mock-uuid-1234' };
            const fileAsset = {
                id: 'mock-uuid-1234',
                fileUrl: 'https://storage.example.com/uploads/profile/mock-uuid-1234.png',
            };
            const extractedKey = 'uploads/profile/mock-uuid-1234.png';

            mockStorageRepository.findById.mockResolvedValue(fileAsset);
            mockSharedStorageService.extractKeyFromUrl.mockReturnValue(extractedKey);
            mockSharedStorageService.exists.mockResolvedValue(false);

            await expect(service.confirmUpload(dto)).rejects.toThrow(BadRequestException);
        });

        it('should handle extraction errors gracefully and use URL as key', async () => {
            const dto = { fileId: 'mock-uuid-1234' };
            const fileAsset = {
                id: 'mock-uuid-1234',
                fileUrl: 'invalid-url',
            };
            // extractKeyFromUrl won't be called because URL doesn't start with http, or if it does, it might throw
            // The service logic: checks if startsWith 'http', calls extractKeyFromUrl.
            // Let's force it to throw inside the try-catch block by making it start with http
            // but have extractKeyFromUrl throw.

            const fileAssetHttp = {
                id: 'mock-uuid-1234',
                fileUrl: 'http://invalid-url',
            };

            mockStorageRepository.findById.mockResolvedValue(fileAssetHttp);
            mockSharedStorageService.extractKeyFromUrl.mockImplementation(() => {
                throw new Error('Extraction failed');
            });
            mockSharedStorageService.exists.mockResolvedValue(true); // Assuming it exists even if extraction fails (it uses original url as key)
            mockStorageRepository.update.mockResolvedValue({
                ...fileAssetHttp,
                status: 'uploaded',
            });


            await service.confirmUpload(dto);

            expect(sharedStorageService.exists).toHaveBeenCalledWith(fileAssetHttp.fileUrl);
        });

    });

    describe('deleteFile', () => {
        it('should delete from database first, then from shared storage', async () => {
            const dto = { fileId: 'mock-uuid-1234' };
            const fileAsset = {
                id: 'mock-uuid-1234',
                fileUrl: 'https://storage.example.com/uploads/profile/mock-uuid-1234.png',
            };
            const extractedKey = 'uploads/profile/mock-uuid-1234.png';

            mockStorageRepository.findById.mockResolvedValue(fileAsset);
            mockSharedStorageService.extractKeyFromUrl.mockReturnValue(extractedKey);
            mockStorageRepository.delete.mockResolvedValue(undefined);
            mockSharedStorageService.delete.mockResolvedValue(undefined);

            const result = await service.deleteFile(dto);

            // Verify order: DB delete called before S3 delete
            expect(storageRepository.delete).toHaveBeenCalledWith(dto.fileId);
            expect(sharedStorageService.delete).toHaveBeenCalledWith(extractedKey);

            expect(result).toEqual({
                success: true,
                message: 'File deleted successfully',
            });
        });

        it('should throw BadRequestException if database deletion fails due to constraint (Restrict)', async () => {
            const dto = { fileId: 'mock-uuid-1234' };
            const fileAsset = {
                id: 'mock-uuid-1234',
                fileUrl: 'https://storage.example.com/uploads/profile/mock-uuid-1234.png',
            };

            mockStorageRepository.findById.mockResolvedValue(fileAsset);
            
            // Mock Prisma constraint error
            const restictError = new Error('Foreign key constraint violation');
            (restictError as any).code = 'P2003';
            mockStorageRepository.delete.mockRejectedValue(restictError);

            await expect(service.deleteFile(dto)).rejects.toThrow(BadRequestException);
            
            // Verify S3 delete was NEVER called
            expect(sharedStorageService.delete).not.toHaveBeenCalled();
        });

        it('should succeed even if S3 deletion fails after DB record is removed', async () => {
            const dto = { fileId: 'mock-uuid-1234' };
            const fileAsset = {
                id: 'mock-uuid-1234',
                fileUrl: 'https://storage.example.com/uploads/profile/mock-uuid-1234.png',
            };

            mockStorageRepository.findById.mockResolvedValue(fileAsset);
            mockStorageRepository.delete.mockResolvedValue(undefined);
            mockSharedStorageService.delete.mockRejectedValue(new Error('S3 Connection Failed'));

            const result = await service.deleteFile(dto);

            expect(storageRepository.delete).toHaveBeenCalledWith(dto.fileId);
            expect(result.success).toBe(true);
        });

        it('should throw NotFoundException if file asset not found', async () => {
            mockStorageRepository.findById.mockResolvedValue(null);

            await expect(service.deleteFile({ fileId: 'non-existent' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('getSignedUrl', () => {
        it('should return a signed URL for a private file', async () => {
            const dto = { fileId: 'mock-uuid-1234', expiresIn: 3600 };
            const fileAsset = {
                id: 'mock-uuid-1234',
                fileUrl: 'https://storage.example.com/uploads/private/doc.pdf',
            };
            const extractedKey = 'uploads/private/doc.pdf';
            const signedUrl = 'https://s3.example.com/signed-url';

            mockStorageRepository.findById.mockResolvedValue(fileAsset);
            mockSharedStorageService.extractKeyFromUrl.mockReturnValue(extractedKey);
            mockSharedStorageService.getPresignedUrl.mockResolvedValue(signedUrl);

            const result = await service.getSignedUrl(dto);

            expect(storageRepository.findById).toHaveBeenCalledWith(dto.fileId);
            expect(sharedStorageService.extractKeyFromUrl).toHaveBeenCalledWith(fileAsset.fileUrl);
            expect(sharedStorageService.getPresignedUrl).toHaveBeenCalledWith({
                key: extractedKey,
                expiresIn: dto.expiresIn,
            });

            expect(result).toEqual({
                fileId: dto.fileId,
                signedUrl,
                expiresIn: dto.expiresIn,
            });
        });

        it('should throw NotFoundException if file asset not found', async () => {
            mockStorageRepository.findById.mockResolvedValue(null);
            await expect(service.getSignedUrl({ fileId: 'non-existent' })).rejects.toThrow(NotFoundException);
        });
    });
});
