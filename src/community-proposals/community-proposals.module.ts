import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityProposalsController } from './community-proposals.controller';
import { CommunityProposalsService } from './community-proposals.service';
import { CommunityProposal } from './entities/community-proposal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityProposal])],
  controllers: [CommunityProposalsController],
  providers: [CommunityProposalsService],
  exports: [CommunityProposalsService],
})
export class CommunityProposalsModule {}
