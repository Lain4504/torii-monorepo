import { IsOptional, IsString, IsEmail } from 'class-validator';

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
    @IsEmail()
    email: string;
    
    @IsString()
    fullName: string;
    
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    dateOfBirth?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    bio?: string;
}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string; 
    
    @IsOptional()
    @IsString()
    fullName?: string; 
    
    @IsOptional()
    @IsString()
    phone?: string; 
    
    @IsOptional()
    @IsString()
    role?: string; 
    
    @IsOptional()
    @IsString()
    status?: string; 
    
    @IsOptional()
    @IsString()
    dateOfBirth?: string; 
    
    @IsOptional()
    @IsString()
    gender?: string; 
    
    @IsOptional()
    @IsString()
    avatarUrl?: string; 
    
    @IsOptional()
    @IsString()
    bio?: string; 
    
    @IsOptional()
    @IsString()
    jlptLevel?: string; 
}

export class DeleteUserDto {
    hardDelete?: boolean; 
}
