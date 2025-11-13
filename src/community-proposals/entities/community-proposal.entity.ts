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

export enum ProposalCategory {
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

export enum ProposalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  VOTING = 'voting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
}

@Entity('community_proposals')
export class CommunityProposal {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ length: 45 })
  title: string;

  @ApiProperty()
  @Column({ length: 45 })
  description: string;

  @ApiProperty()
  @Column({ length: 100 })
  neighborhood: string;

  @ApiProperty({ enum: ProposalCategory })
  @Column({
    type: 'enum',
    enum: ProposalCategory,
  })
  category: ProposalCategory;

  @ApiProperty({ enum: ProposalStatus })
  @Column({
    type: 'enum',
    enum: ProposalStatus,
  })
  status: ProposalStatus;

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
