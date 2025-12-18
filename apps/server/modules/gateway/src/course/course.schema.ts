
import { ApiProperty } from '@nestjs/swagger';

export class Course {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    published: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class CreateCourseInput {
    @ApiProperty()
    title: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    price: number;

    @ApiProperty({ required: false })
    published?: boolean;
}

export class UpdateCourseInput {
    @ApiProperty({ required: false })
    title?: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    price?: number;

    @ApiProperty({ required: false })
    published?: boolean;
}

