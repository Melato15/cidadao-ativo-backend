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

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  VOTING = 'voting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
}

export enum ProjectCategory {
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

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty({ enum: ProjectCategory })
  @Column({
    type: 'enum',
    enum: ProjectCategory,
  })
  category: ProjectCategory;

  @ApiProperty({ enum: ProjectStatus, default: ProjectStatus.DRAFT })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @ApiProperty()
  @Column({ length: 50 })
  neighborhood: string;

  @ApiProperty()
  @Column({ default: 0 })
  votesFor: number;

  @ApiProperty()
  @Column({ default: 0 })
  votesAgainst: number;

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
