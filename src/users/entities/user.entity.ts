import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin',
  COUNCILOR = 'councilor',
}

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ unique: true })
  cpf: string;

  @Column()
  @Exclude()
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CITIZEN })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN,
  })
  role: UserRole;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
