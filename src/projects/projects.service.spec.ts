import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Project,
  ProjectCategory,
  ProjectStatus,
} from './entities/project.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockProject = {
  id: '1',
  title: 'Test Project',
  description: 'Test Description',
  category: ProjectCategory.HEALTH,
  status: ProjectStatus.ACTIVE,
  neighborhood: 'Centro',
  authorId: 'user1',
  votesFor: 0,
  votesAgainst: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 'user1', name: 'User 1' },
};

const mockProjectsRepository = {
  create: jest.fn().mockReturnValue(mockProject),
  save: jest.fn().mockReturnValue(mockProject),
  find: jest.fn().mockReturnValue([mockProject]),
  findOne: jest.fn().mockReturnValue(mockProject),
  update: jest
    .fn()
    .mockReturnValue({ affected: 1, raw: [], generatedMaps: [] }),
  delete: jest.fn().mockReturnValue({ affected: 1, raw: [] }),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: Repository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repository = module.get<Repository<Project>>(getRepositoryToken(Project));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project', async () => {
      const createDto = {
        title: 'Test Project',
        description: 'Test Description',
        category: ProjectCategory.HEALTH,
        neighborhood: 'Centro',
        budget: 1000,
        deadline: new Date(),
        authorId: 'user1',
      };

      const result = await service.create(createDto);
      expect(result).toEqual(mockProject);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockProject]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockProject);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['author'],
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAuthor', () => {
    it('should return projects by author', async () => {
      const result = await service.findByAuthor('user1');
      expect(result).toEqual([mockProject]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { authorId: 'user1' },
        relations: ['author'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { title: 'Updated Title' };
      const result = await service.update('1', updateDto, 'user1');
      expect(result).toEqual(mockProject);
      expect(repository.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      const updateDto = { title: 'Updated Title' };
      await expect(service.update('1', updateDto, 'user2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      await service.remove('1', 'user1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw ForbiddenException if user is not author', async () => {
      await expect(service.remove('1', 'user2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('vote', () => {
    it('should increment votesFor', async () => {
      const project = { ...mockProject, votesFor: 0 };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(project as any);
      jest.spyOn(repository, 'save').mockResolvedValueOnce({
        ...project,
        votesFor: 1,
      } as any);

      const result = await service.vote('1', 'for');
      expect(result.votesFor).toBe(1);
    });

    it('should increment votesAgainst', async () => {
      const project = { ...mockProject, votesAgainst: 0 };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(project as any);
      jest.spyOn(repository, 'save').mockResolvedValueOnce({
        ...project,
        votesAgainst: 1,
      } as any);

      const result = await service.vote('1', 'against');
      expect(result.votesAgainst).toBe(1);
    });
  });
});
