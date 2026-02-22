import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { StorageController } from '../../src/modules/storage/controllers/storage.controller';
import { GatewayAuthGuard } from '@server/shared';

// ---------------------------------------------------------------------------
// Mock Helpers
// ---------------------------------------------------------------------------

function createNatsMock() {
  return {
    send: jest.fn(),
  };
}

function createReqMock(overrides: any = {}) {
  return {
    requester: { sub: 'user-123', ...overrides },
    ...overrides,
  } as any;
}

// ---------------------------------------------------------------------------
// StorageController Tests
// ---------------------------------------------------------------------------

describe('StorageController (Gateway)', () => {
  let controller: StorageController;
  let natsMock: ReturnType<typeof createNatsMock>;

  beforeEach(async () => {
    natsMock = createNatsMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [{ provide: 'NATS_SERVICE', useValue: natsMock }],
    })
      .overrideGuard(GatewayAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StorageController>(StorageController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('generatePresignedUploadUrl()', () => {
    it('should forward request to NATS with ownerId from requester', async () => {
      const data = { fileName: 'test.jpg' };
      const natsResponse = { url: 'https://s3/test.jpg' };
      natsMock.send.mockReturnValue(of(natsResponse));
      const req = createReqMock({ sub: 'user-789' });

      const result = await controller.generatePresignedUploadUrl(data, req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'storage.generatePresignedUploadUrl' },
        { ...data, ownerId: 'user-789' }
      );
      expect(result).toMatchObject({ success: true, data: natsResponse });
    });

    it('should return errorResponse if NATS fails', async () => {
      natsMock.send.mockReturnValue(throwError(() => new Error('Storage down')));
      const result = await controller.generatePresignedUploadUrl({}, createReqMock());
      expect(result).toMatchObject({ success: false, message: 'Storage down' });
    });
  });

  describe('confirmUpload()', () => {
    it('should forward confirm request to NATS', async () => {
      const data = { fileId: 'f1' };
      natsMock.send.mockReturnValue(of({ success: true }));

      const result = await controller.confirmUpload(data);

      expect(natsMock.send).toHaveBeenCalledWith({ cmd: 'storage.confirmUpload' }, data);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteFile()', () => {
    it('should forward delete request to NATS by id', async () => {
      natsMock.send.mockReturnValue(of({ deleted: true }));
      const result = await controller.deleteFile('f123');

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'storage.deleteFile' },
        { fileId: 'f123' }
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getSignedUrl()', () => {
    it('should fetch signed URL from NATS', async () => {
      const query = { fileId: 'f1' };
      natsMock.send.mockReturnValue(of({ signedUrl: 'http://...' }));

      const result = await controller.getSignedUrl(query);

      expect(natsMock.send).toHaveBeenCalledWith({ cmd: 'storage.getSignedUrl' }, query);
      expect(result.data.signedUrl).toBe('http://...');
    });
  });
});
