import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import {
  ReportCategory,
  ReportStatus,
  ReportPriority,
} from '../entities/report.entity';

export class CreateReportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ReportCategory })
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiProperty({ enum: ReportPriority })
  @IsEnum(ReportPriority)
  priority: ReportPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  authorId: string;
}
