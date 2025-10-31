import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);
    return this.projectsRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    return project;
  }

  async findByAuthor(authorId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId?: string,
  ): Promise<Project> {
    const project = await this.findOne(id);

    // Verifica se o usuário é o autor do projeto
    if (userId && project.authorId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este projeto',
      );
    }

    await this.projectsRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const project = await this.findOne(id);

    // Verifica se o usuário é o autor do projeto
    if (userId && project.authorId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este projeto',
      );
    }

    await this.projectsRepository.delete(id);
  }

  async vote(id: string, voteType: 'for' | 'against'): Promise<Project> {
    const project = await this.findOne(id);

    if (voteType === 'for') {
      project.votesFor += 1;
    } else {
      project.votesAgainst += 1;
    }

    return this.projectsRepository.save(project);
  }
}
