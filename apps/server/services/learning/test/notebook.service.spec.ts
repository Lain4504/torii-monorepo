import { Test, TestingModule } from '@nestjs/testing';
import { NotebookService } from '@server/learning/modules/notebook/notebook.service';
import { NOTEBOOK_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-notebook.repository';
import { getMapperToken } from '@automapper/nestjs';
import { RpcException } from '@nestjs/microservices';

describe('NotebookService', () => {
  let service: NotebookService;
  let notebookRepo: any;
  let mapper: any;

  const mockNotebook = {
    id: 'nb-1',
    userId: 'user-1',
    name: 'My Notebook',
    isPublic: false,
    entries: [],
  };

  const mockEntry = {
    id: 'e-1',
    notebookId: 'nb-1',
    word: 'Japan',
    meaning: 'Nihon',
  };

  const mockNotebookRepository = {
    findById: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createEntry: jest.fn(),
    findEntryById: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
    bulkCreateEntries: jest.fn(),
  };

  const mockMapper = {
    map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
    mapArray: jest
      .fn()
      .mockImplementation((arr) => arr.map((val) => ({ ...val }))),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotebookService,
        {
          provide: NOTEBOOK_REPOSITORY_TOKEN,
          useValue: mockNotebookRepository,
        },
        {
          provide: getMapperToken(),
          useValue: mockMapper,
        },
      ],
    }).compile();

    service = module.get<NotebookService>(NotebookService);
    notebookRepo = module.get(NOTEBOOK_REPOSITORY_TOKEN);
    mapper = module.get(getMapperToken());

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotebook', () => {
    it('should create notebook if name not duplicate', async () => {
      mockNotebookRepository.count.mockResolvedValue(0);
      mockNotebookRepository.create.mockResolvedValue(mockNotebook);

      const result = await service.createNotebook({
        userId: 'user-1',
        name: 'New',
      });

      expect(result.id).toBe(mockNotebook.id);
      expect(notebookRepo.create).toHaveBeenCalled();
    });

    it('should throw RpcException if name duplicate', async () => {
      mockNotebookRepository.count.mockResolvedValue(1);
      await expect(
        service.createNotebook({ userId: 'user-1', name: 'Existing' }),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('addEntry', () => {
    it('should add entry to notebook', async () => {
      mockNotebookRepository.findById.mockResolvedValue(mockNotebook);
      mockNotebookRepository.createEntry.mockResolvedValue(mockEntry);

      const result = await service.addEntry(
        'nb-1',
        { word: 'W', meaning: 'M' },
        'user-1',
      );

      expect(result.id).toBe(mockEntry.id);
      expect(notebookRepo.createEntry).toHaveBeenCalled();
      expect(notebookRepo.update).toHaveBeenCalled(); // Increment count
    });

    it('should throw RpcException if not owner', async () => {
      mockNotebookRepository.findById.mockResolvedValue({
        ...mockNotebook,
        userId: 'other',
      });
      await expect(
        service.addEntry('nb-1', { word: 'W', meaning: 'M' }, 'user-1'),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('deleteNotebook', () => {
    it('should delete notebook if owner', async () => {
      mockNotebookRepository.findById.mockResolvedValue(mockNotebook);
      await service.deleteNotebook('nb-1', 'user-1');
      expect(notebookRepo.delete).toHaveBeenCalledWith('nb-1');
    });
  });
});
