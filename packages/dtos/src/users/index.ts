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
