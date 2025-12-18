export class CreateCourseDto {
  title!: string;
  description?: string | null;
  price!: number;
  published?: boolean;
}

export class UpdateCourseDto {
  title?: string;
  description?: string | null;
  price?: number;
  published?: boolean;
}

