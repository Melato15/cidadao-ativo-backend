import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum ReportCategory {
  INFRASTRUCTURE = 'infrastructure',
  EDUCATION = 'education',
  HEALTH = 'health',
  SECURITY = 'security',
  ENVIRONMENT = 'environment',
  CULTURE = 'culture',
  SPORTS = 'sports',
  TRANSPORTATION = 'transportation',
  OTHER = 'other',
}

export enum ReportStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  VOTING = 'voting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
}

export enum ReportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('reports')
export class Report {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ length: 255 })
  title: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty({ enum: ReportCategory })
  @Column({
    type: 'enum',
    enum: ReportCategory,
  })
  category: ReportCategory;

  @ApiProperty({ enum: ReportStatus })
  @Column({
    type: 'enum',
    enum: ReportStatus,
  })
  status: ReportStatus;

  @ApiProperty({ enum: ReportPriority })
  @Column({
    type: 'enum',
    enum: ReportPriority,
  })
  priority: ReportPriority;

  @ApiProperty()
  @Column('text', { nullable: true })
  location?: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ApiProperty()
  @Column({ name: 'authorId' })
  authorId: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
