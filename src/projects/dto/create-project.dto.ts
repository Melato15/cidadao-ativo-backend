import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ProjectCategory, ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ProjectCategory })
  @IsEnum(ProjectCategory)
  category: ProjectCategory;

  @ApiProperty({ enum: ProjectStatus, required: false })
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  neighborhood: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  authorId: string;
}
