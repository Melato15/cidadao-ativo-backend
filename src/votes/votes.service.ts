import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote, VoteType } from './entities/vote.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async vote(
    userId: string,
    projectId: string,
    voteType: VoteType,
    comment?: string,
  ): Promise<Vote> {
    // Verificar se o projeto existe
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar se o usuário já votou neste projeto
    const existingVote = await this.votesRepository.findOne({
      where: { userId, projectId },
    });

    if (existingVote) {
      // Se já votou, atualizar o voto
      if (existingVote.type !== voteType) {
        // Atualizar contadores do projeto
        if (existingVote.type === VoteType.UP) {
          project.votesFor -= 1;
          project.votesAgainst += 1;
        } else {
          project.votesFor += 1;
          project.votesAgainst -= 1;
        }

        existingVote.type = voteType;
        if (comment) {
          existingVote.comment = comment;
        }

        await this.projectsRepository.save(project);
        return this.votesRepository.save(existingVote);
      }

      // Se o voto é o mesmo, apenas atualizar o comentário se fornecido
      if (comment) {
        existingVote.comment = comment;
        return this.votesRepository.save(existingVote);
      }

      return existingVote;
    }

    // Criar novo voto
    const vote = this.votesRepository.create({
      userId,
      projectId,
      type: voteType,
      comment,
    });

    // Atualizar contadores do projeto
    if (voteType === VoteType.UP) {
      project.votesFor += 1;
    } else {
      project.votesAgainst += 1;
    }

    await this.projectsRepository.save(project);
    return this.votesRepository.save(vote);
  }

  async removeVote(userId: string, projectId: string): Promise<void> {
    const vote = await this.votesRepository.findOne({
      where: { userId, projectId },
    });

    if (!vote) {
      throw new NotFoundException('Voto não encontrado');
    }

    // Atualizar contadores do projeto
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });

    if (project) {
      if (vote.type === VoteType.UP) {
        project.votesFor = Math.max(0, project.votesFor - 1);
      } else {
        project.votesAgainst = Math.max(0, project.votesAgainst - 1);
      }

      await this.projectsRepository.save(project);
    }

    await this.votesRepository.remove(vote);
  }

  async getUserVote(userId: string, projectId: string): Promise<Vote | null> {
    return this.votesRepository.findOne({
      where: { userId, projectId },
    });
  }

  async getProjectVotes(projectId: string): Promise<Vote[]> {
    return this.votesRepository.find({
      where: { projectId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserVotes(userId: string): Promise<Vote[]> {
    return this.votesRepository.find({
      where: { userId },
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });
  }
}
