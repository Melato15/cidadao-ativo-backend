import { Test, TestingModule } from '@nestjs/testing';
import { CommunityProposalsService } from './community-proposals.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommunityProposal } from './entities/community-proposal.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommunityProposalsService', () => {
  let service: CommunityProposalsService;
  let repository: Repository<CommunityProposal>;

  const mockProposal = {
    id: 1,
    title: 'Proposal 1',
    description: 'Description',
    authorId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityProposalsService,
        {
          provide: getRepositoryToken(CommunityProposal),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommunityProposalsService>(CommunityProposalsService);
    repository = module.get<Repository<CommunityProposal>>(
      getRepositoryToken(CommunityProposal),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a proposal', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(mockProposal as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockProposal as any);

      const result = await service.create(
        { title: 'Proposal 1', description: 'Description' } as any,
        'user1',
      );

      expect(result).toEqual(mockProposal);
      expect(repository.create).toHaveBeenCalledWith({
        title: 'Proposal 1',
        description: 'Description',
        authorId: 'user1',
      });
    });
  });

  describe('findAll', () => {
    it('should return all proposals', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockProposal] as any);

      const result = await service.findAll();

      expect(result).toEqual([mockProposal]);
    });
  });

  describe('findOne', () => {
    it('should return a proposal', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProposal as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProposal);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a proposal', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProposal as any);
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(
        1,
        { title: 'Updated' } as any,
        'user1',
      );

      expect(result).toEqual(mockProposal);
      expect(repository.update).toHaveBeenCalledWith(1, { title: 'Updated' });
    });

    it('should throw ForbiddenException if user is not author', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProposal as any);

      await expect(
        service.update(1, { title: 'Updated' } as any, 'user2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a proposal', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProposal as any);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.remove(1, 'user1');

      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProposal as any);

      await expect(service.remove(1, 'user2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
