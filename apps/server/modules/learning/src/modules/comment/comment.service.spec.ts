import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { PostRepository } from '../post/post.repository';
import { PrismaService } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
    CommentTargetType,
} from '@workspace/schemas';
import type {
    CommentCreateDTO,
    CommentUpdateDTO,
    CommentQueryDTO,
    CommentResponseDTO
} from '@workspace/schemas';

describe('CommentService', () => {
    let service: CommentService;
    let commentRepository: any;
    let postRepository: any;
    let prisma: any;
    let mapper: any;
    let natsClient: any;

    const USER_ID = '00000000-0000-0000-0000-000000000001';
    const POST_ID = '00000000-0000-0000-0000-000000000002';
    const COMMENT_ID = '00000000-0000-0000-0000-000000000003';

    const mockComment = {
        id: COMMENT_ID,
        userId: USER_ID,
        content: 'original content',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: USER_ID, displayName: 'User One', avatarUrl: 'avatar.png' },
        _count: { replies: 0, likes: 0 },
    };

    const mockDTO: any = {
        id: COMMENT_ID,
        content: 'original content',
        author: { id: USER_ID, displayName: 'User One', avatarUrl: 'avatar.png' },
        replyCount: 0,
        likeCount: 0,
        isLiked: false,
        replies: [],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                {
                    provide: CommentRepository,
                    useValue: {
                        findById: jest.fn(),
                        findByIdWithReplyCount: jest.fn(),
                        findMany: jest.fn(),
                        count: jest.fn(),
                        create: jest.fn(),
                        createWithTarget: jest.fn(),
                        update: jest.fn(),
                        softDelete: jest.fn(),
                        findWithReplies: jest.fn(),
                    },
                },
                {
                    provide: PostRepository,
                    useValue: {
                        update: jest.fn(),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: {
                        post: { findUnique: jest.fn() },
                        qA: { findUnique: jest.fn(), update: jest.fn() },
                        user: { findUnique: jest.fn() },
                        commentLike: {
                            findUnique: jest.fn(),
                            delete: jest.fn(),
                            create: jest.fn(),
                            count: jest.fn(),
                        },
                        $transaction: jest.fn((cb) => cb({
                            comment: { create: jest.fn().mockResolvedValue(mockComment) },
                            commentTarget: { create: jest.fn() }
                        })),
                    },
                },
                {
                    provide: getMapperToken(),
                    useValue: {
                        map: jest.fn(),
                    },
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: {
                        emit: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CommentService>(CommentService);
        commentRepository = module.get(CommentRepository);
        postRepository = module.get(PostRepository);
        prisma = module.get(PrismaService);
        mapper = module.get(getMapperToken());
        natsClient = module.get('NATS_SERVICE');

        // Default mapper implementation
        mapper.map.mockReturnValue(mockDTO);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createComment', () => {
        const createDto: CommentCreateDTO = {
            content: 'New Comment',
            userId: USER_ID,
            authorId: USER_ID,
            entityId: POST_ID,
            targetType: CommentTargetType.BLOG,
        };

        it('should create a root comment successfully', async () => {
            prisma.post.findUnique.mockResolvedValue({ id: POST_ID });
            prisma.user.findUnique.mockResolvedValue({ id: USER_ID });

            commentRepository.createWithTarget.mockResolvedValue(mockComment);
            postRepository.update.mockResolvedValue({});

            const result = await service.createComment(createDto);

            expect(prisma.post.findUnique).toHaveBeenCalled();
            expect(commentRepository.createWithTarget).toHaveBeenCalled();
            expect(result).toEqual(mockDTO);
        });

        it('should throw NotFoundException if post not found', async () => {
            prisma.post.findUnique.mockResolvedValue(null);
            await expect(service.createComment(createDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAllComments', () => {
        it('should return paginated comments', async () => {
            const query: CommentQueryDTO = {
                page: 1,
                limit: 10,
                entityId: POST_ID,
                targetType: CommentTargetType.BLOG
            };

            commentRepository.findMany.mockResolvedValue([mockComment]);
            commentRepository.count.mockResolvedValue(1);

            const result = await service.findAllComments(query);

            expect(commentRepository.findMany).toHaveBeenCalled();
            expect(result.total).toBe(1);
        });
    });

    describe('findCommentById', () => {
        it('should return a comment by id', async () => {
            commentRepository.findByIdWithReplyCount.mockResolvedValue(mockComment);
            const result = await service.findCommentById(COMMENT_ID);
            expect(result).toEqual(mockDTO);
        });
    });

    describe('updateComment', () => {
        const updateDto: CommentUpdateDTO = { content: 'updated content' };

        it('should update comment if author matches', async () => {
            commentRepository.findById.mockResolvedValue(mockComment);
            commentRepository.update.mockResolvedValue({ ...mockComment, content: 'updated content' });
            const result = await service.updateComment(COMMENT_ID, USER_ID, updateDto);
            expect(result).toBeDefined();
        });

        it('should throw BadRequestException if author does not match', async () => {
            commentRepository.findById.mockResolvedValue(mockComment);
            await expect(service.updateComment(COMMENT_ID, 'wrong-user', updateDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('deleteComment', () => {
        it('should soft delete comment', async () => {
            const commentToDelete = { ...mockComment, targetType: 'BLOG', entityId: POST_ID };
            commentRepository.findById.mockResolvedValue(commentToDelete);
            commentRepository.softDelete.mockResolvedValue({});
            const result = await service.deleteComment(COMMENT_ID, USER_ID);
            expect(result.success).toBe(true);
        });
    });

    describe('toggleLike', () => {
        it('should toggle like', async () => {
            prisma.commentLike.findUnique.mockResolvedValue(null);
            prisma.commentLike.count.mockResolvedValue(1);
            const result = await service.toggleLike(COMMENT_ID, USER_ID);
            expect(prisma.commentLike.create).toHaveBeenCalled();
            expect(result.isLiked).toBe(true);
        });
    });
});
