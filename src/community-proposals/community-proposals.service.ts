import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommunityProposalDto } from './dto/create-community-proposal.dto';
import { UpdateCommunityProposalDto } from './dto/update-community-proposal.dto';
import {
  ProposalStatus,
  CommunityProposal,
} from './entities/community-proposal.entity';

@Injectable()
export class CommunityProposalsService {
  constructor(
    @InjectRepository(CommunityProposal)
    private readonly proposalRepository: Repository<CommunityProposal>,
  ) {}

  async create(
    createDto: CreateCommunityProposalDto,
    userId: string,
  ): Promise<CommunityProposal> {
    const proposal = this.proposalRepository.create({
      ...createDto,
      authorId: userId,
      status: ProposalStatus.DRAFT,
    });

    return this.proposalRepository.save(proposal);
  }

  async findAll(): Promise<CommunityProposal[]> {
    return this.proposalRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CommunityProposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    return proposal;
  }

  async update(
    id: number,
    updateDto: UpdateCommunityProposalDto,
    userId: string,
  ): Promise<CommunityProposal> {
    const proposal = await this.findOne(id);

    if (proposal.authorId !== userId) {
      throw new ForbiddenException('You can only update your own proposals');
    }

    await this.proposalRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number, userId: string): Promise<void> {
    const proposal = await this.findOne(id);

    if (proposal.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own proposals');
    }

    await this.proposalRepository.delete(id);
  }

  async getStatsByCategory() {
    const result = await this.proposalRepository
      .createQueryBuilder('proposal')
      .select('proposal.category', 'category')
      .addSelect('COUNT(proposal.id)', 'count')
      .groupBy('proposal.category')
      .getRawMany();

    return result.map((item) => ({
      category: item.category,
      count: parseInt(item.count, 10),
    }));
  }

  async getStatsMonthly() {
    const result = await this.proposalRepository
      .createQueryBuilder('proposal')
      .select("DATE_FORMAT(proposal.createdAt, '%b')", 'month')
      .addSelect('MONTH(proposal.createdAt)', 'monthNum')
      .addSelect('COUNT(proposal.id)', 'propostas')
      .addSelect(
        "SUM(CASE WHEN proposal.status = 'approved' THEN 1 ELSE 0 END)",
        'aprovadas',
      )
      .groupBy('month, monthNum')
      .orderBy('monthNum', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      month: item.month,
      propostas: parseInt(item.propostas, 10),
      aprovadas: parseInt(item.aprovadas, 10),
    }));
  }
}
