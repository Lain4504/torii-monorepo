import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Course {
  @Field(() => Int)
  id!: number;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Float)
  price!: number;

  @Field()
  published!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

