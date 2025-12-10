import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@server/shared/base.entity';

@Entity({ name: 'courses' })
export class Course extends BaseEntity {
  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      from: (value?: string | null) => (value ? Number(value) : 0),
      to: (value?: number | null) => value ?? 0,
    },
  })
  price!: number;

  @Column({ default: false })
  published!: boolean;
}
