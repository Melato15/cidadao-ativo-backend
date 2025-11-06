import { PartialType } from '@nestjs/swagger';
import { CreateCommunityProposalDto } from './create-community-proposal.dto';

export class UpdateCommunityProposalDto extends PartialType(
  CreateCommunityProposalDto,
) {}
