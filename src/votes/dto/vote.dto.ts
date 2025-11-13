import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum VoteTypeDto {
  UP = 'up',
  DOWN = 'down',
}

export class CreateVoteDto {
  @ApiProperty({ enum: VoteTypeDto, description: 'Tipo do voto' })
  @IsEnum(VoteTypeDto)
  type: VoteTypeDto;

  @ApiPropertyOptional({ description: 'Comentário opcional sobre o voto' })
  @IsOptional()
  @IsString()
  comment?: string;
}
