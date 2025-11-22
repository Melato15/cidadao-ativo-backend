import { Test, TestingModule } from '@nestjs/testing';
import { VotesService } from './votes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vote, VoteType } from './entities/vote.entity';
import { Project } from '../projects/entities/project.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('VotesService', () => {
  let service: VotesService;
  let votesRepository: Repository<Vote>;
  let projectsRepository: Repository<Project>;

  const mockVote = {
    id: '1',
    userId: 'user1',
    projectId: 'project1',
    type: VoteType.UP,
    comment: 'Great project',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: undefined,
    project: undefined,
  };

  const mockProject = {
    id: 'project1',
    title: 'Project 1',
    votesFor: 0,
    votesAgainst: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotesService,
        {
          provide: getRepositoryToken(Vote),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Project),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VotesService>(VotesService);
    votesRepository = module.get<Repository<Vote>>(getRepositoryToken(Vote));
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('vote', () => {
    it('should create a new vote', async () => {
      jest
        .spyOn(projectsRepository, 'findOne')
        .mockResolvedValue({ ...mockProject } as Project);
      jest.spyOn(votesRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(votesRepository, 'create')
        .mockReturnValue(mockVote as unknown as Vote);
      jest
        .spyOn(votesRepository, 'save')
        .mockResolvedValue(mockVote as unknown as Vote);

      const result = await service.vote(
        'user1',
        'project1',
        VoteType.UP,
        'Great',
      );

      expect(result).toEqual(mockVote);
      expect(projectsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ votesFor: 1 }),
      );
    });

    it('should update existing vote (change type)', async () => {
      const existingVote = { ...mockVote, type: VoteType.DOWN };
      const project = { ...mockProject, votesFor: 0, votesAgainst: 1 };

      jest
        .spyOn(projectsRepository, 'findOne')
        .mockResolvedValue(project as Project);
      jest
        .spyOn(votesRepository, 'findOne')
        .mockResolvedValue(existingVote as unknown as Vote);
      jest
        .spyOn(votesRepository, 'save')
        .mockResolvedValue({
          ...existingVote,
          type: VoteType.UP,
        } as unknown as Vote);

      await service.vote('user1', 'project1', VoteType.UP);

      expect(projectsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ votesFor: 1, votesAgainst: 0 }),
      );
    });

    it('should update existing vote (same type, update comment)', async () => {
      jest
        .spyOn(projectsRepository, 'findOne')
        .mockResolvedValue({ ...mockProject } as Project);
      jest
        .spyOn(votesRepository, 'findOne')
        .mockResolvedValue({ ...mockVote } as unknown as Vote);
      jest
        .spyOn(votesRepository, 'save')
        .mockResolvedValue({
          ...mockVote,
          comment: 'Updated',
        } as unknown as Vote);

      await service.vote('user1', 'project1', VoteType.UP, 'Updated');

      expect(projectsRepository.save).not.toHaveBeenCalled();
      expect(votesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ comment: 'Updated' }),
      );
    });

    it('should throw NotFoundException if project not found', async () => {
      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.vote('user1', 'project1', VoteType.UP),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeVote', () => {
    it('should remove vote and update counters', async () => {
      const project = { ...mockProject, votesFor: 1 };
      jest
        .spyOn(votesRepository, 'findOne')
        .mockResolvedValue(mockVote as unknown as Vote);
      jest
        .spyOn(projectsRepository, 'findOne')
        .mockResolvedValue(project as Project);

      await service.removeVote('user1', 'project1');

      expect(projectsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ votesFor: 0 }),
      );
      expect(votesRepository.remove).toHaveBeenCalledWith(mockVote);
    });

    it('should throw NotFoundException if vote not found', async () => {
      jest.spyOn(votesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.removeVote('user1', 'project1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserVote', () => {
    it('should return user vote', async () => {
      jest
        .spyOn(votesRepository, 'findOne')
        .mockResolvedValue(mockVote as unknown as Vote);

      const result = await service.getUserVote('user1', 'project1');
      expect(result).toEqual(mockVote);
    });
  });

  describe('getProjectVotes', () => {
    it('should return project votes', async () => {
      jest
        .spyOn(votesRepository, 'find')
        .mockResolvedValue([mockVote as unknown as Vote]);

      const result = await service.getProjectVotes('project1');
      expect(result).toEqual([mockVote]);
    });
  });

  describe('getUserVotes', () => {
    it('should return user votes', async () => {
      jest
        .spyOn(votesRepository, 'find')
        .mockResolvedValue([mockVote as unknown as Vote]);

      const result = await service.getUserVotes('user1');
      expect(result).toEqual([mockVote]);
    });
  });
});
