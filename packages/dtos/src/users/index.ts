export class UserResponseDto {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string;
    phone: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export class FindAllUsersParamsDto {
    page?: number = 1;
    limit?: number = 10;
    search?: string;
}

export class CreateUserDto {
    email: string;
    fullName: string;
    password: string;
    phone?: string;
    role?: string;
    status?: string;
    dateOfBirth?: string;
    gender?: string;
    avatarUrl?: string;
    bio?: string;
}

export class UpdateUserDto {
    email?: string; 
    fullName?: string; 
    phone?: string; 
    role?: string; 
    status?: string; 
    dateOfBirth?: string; 
    gender?: string; 
    avatarUrl?: string; 
    bio?: string; 
    jlptLevel?: string; 
}

export class DeleteUserDto {
    hardDelete?: boolean; 
}
