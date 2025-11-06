import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  ProposalCategory,
  ProposalStatus,
} from '../entities/community-proposal.entity';

export class CreateCommunityProposalDto {
  @ApiProperty({ example: 'Parquinho Infantil na Praça da Vila' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(45)
  title: string;

  @ApiProperty({
    example: 'Proposta para instalação de um parquinho infantil...',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(45)
  description: string;

  @ApiProperty({
    enum: ProposalCategory,
    example: ProposalCategory.INFRASTRUCTURE,
  })
  @IsEnum(ProposalCategory)
  category: ProposalCategory;

  @ApiProperty({ example: 'Vila Nova' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  neighborhood: string;

  @ApiProperty({ enum: ProposalStatus, example: ProposalStatus.ACTIVE })
  @IsEnum(ProposalStatus)
  status: ProposalStatus;
}
