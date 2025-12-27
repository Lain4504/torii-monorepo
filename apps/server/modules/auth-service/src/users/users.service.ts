import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { PaginatedResponseDto, FindAllUsersParamsDto, UserResponseDto, UpdateUserDto, CreateUserDto } from '@workspace/dtos';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

  
    private mapUserToResponseDto(user: any): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl || '',
            phone: user.phone || '',
            role: user.role || 'learner',
            status: user.status || 'active',
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }

    async findAll(params: FindAllUsersParamsDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        try {
            const { page = 1, limit = 10, search } = params;
            const skip = (page - 1) * limit;

            const whereClause: any = {
                deletedAt: null, 
            };
            if (search) {
                whereClause.OR = [
                    { email: { contains: search, mode: 'insensitive' } },
                    { fullName: { contains: search, mode: 'insensitive' } },
                ];
            }

            const [total, users] = await Promise.all([
                this.prisma.user.count({ where: whereClause }),
                this.prisma.user.findMany({
                    take: limit,
                    skip: skip,
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / limit);

            const userDtos: UserResponseDto[] = users.map(user => this.mapUserToResponseDto(user));

            return {
                success: true,
                message: `${userDtos.length} user(s) retrieved successfully`,
                error: '',
                data: userDtos,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve users',
                error: error?.message || 'An unexpected error occurred',
                data: [],
                meta: {
                    page: 0,
                    limit: 0,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                }
            } as PaginatedResponseDto<UserResponseDto>;
        }
    }

  
    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return this.mapUserToResponseDto(user);
    }

    /**
     * Create new user
     */
    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        // Validate input
        if (!createUserDto.email || !createUserDto.fullName) {
            throw new BadRequestException('Email and fullName are required');
        }

        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException(`Email ${createUserDto.email} is already in use`);
        }

        // Create user - Password is handled by Supabase Auth
        const user = await this.prisma.user.create({
            data: {
                id: uuidv4(),
                email: createUserDto.email,
                fullName: createUserDto.fullName,
                phone: createUserDto.phone || null,
                role: createUserDto.role || 'learner',
                status: createUserDto.status || 'active',
                dateOfBirth: createUserDto.dateOfBirth ? new Date(createUserDto.dateOfBirth) : null,
                gender: createUserDto.gender || null,
                avatarUrl: createUserDto.avatarUrl || null,
                bio: createUserDto.bio || null,
            },
        });

        return this.mapUserToResponseDto(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });

            if (emailExists) {
                throw new ConflictException(`Email ${updateUserDto.email} is already in use`);
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...(updateUserDto.email !== undefined && { email: updateUserDto.email }),
                ...(updateUserDto.fullName !== undefined && { fullName: updateUserDto.fullName }),
                ...(updateUserDto.phone !== undefined && { phone: updateUserDto.phone }),
                ...(updateUserDto.role !== undefined && { role: updateUserDto.role }),
                ...(updateUserDto.status !== undefined && { status: updateUserDto.status }),
                ...(updateUserDto.dateOfBirth !== undefined && { dateOfBirth: updateUserDto.dateOfBirth ? new Date(updateUserDto.dateOfBirth) : null }),
                ...(updateUserDto.gender !== undefined && { gender: updateUserDto.gender }),
                ...(updateUserDto.avatarUrl !== undefined && { avatarUrl: updateUserDto.avatarUrl }),
                ...(updateUserDto.bio !== undefined && { bio: updateUserDto.bio }),
                ...(updateUserDto.jlptLevel !== undefined && { jlptLevel: updateUserDto.jlptLevel }),
            },
        });

        return this.mapUserToResponseDto(updatedUser);
    }

    async delete(id: string, hardDelete: boolean = false): Promise<{ message: string }> {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (hardDelete) {
            await this.prisma.user.delete({
                where: { id },
            });
            return { message: `User ${id} permanently deleted` };
        } else {
            await this.prisma.user.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    status: 'inactive', 
                },
            });
            return { message: `User ${id} deactivated (soft deleted)` };
        }
    }
}
