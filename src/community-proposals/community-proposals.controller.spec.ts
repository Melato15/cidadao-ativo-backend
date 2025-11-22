import { Test, TestingModule } from '@nestjs/testing';
import { CommunityProposalsController } from './community-proposals.controller';
import { CommunityProposalsService } from './community-proposals.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('CommunityProposalsController', () => {
  let controller: CommunityProposalsController;
  let service: CommunityProposalsService;

  const mockProposal = {
    id: 1,
    title: 'Proposal 1',
    description: 'Description',
    authorId: 'user1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityProposalsController],
      providers: [
        {
          provide: CommunityProposalsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CommunityProposalsController>(
      CommunityProposalsController,
    );
    service = module.get<CommunityProposalsService>(CommunityProposalsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a proposal', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockProposal as any);

      const result = await controller.create(
        { title: 'Proposal 1', description: 'Description' } as any,
        { user: { sub: 'user1' } },
      );

      expect(result).toEqual(mockProposal);
      expect(service.create).toHaveBeenCalledWith(
        { title: 'Proposal 1', description: 'Description' },
        'user1',
      );
    });
  });

  describe('findAll', () => {
    it('should return all proposals', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockProposal] as any);

      const result = await controller.findAll();

      expect(result).toEqual([mockProposal]);
    });
  });

  describe('findOne', () => {
    it('should return a proposal', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProposal as any);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockProposal);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a proposal', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockProposal as any);

      const result = await controller.update('1', { title: 'Updated' } as any, {
        user: { sub: 'user1' },
      });

      expect(result).toEqual(mockProposal);
      expect(service.update).toHaveBeenCalledWith(
        1,
        { title: 'Updated' },
        'user1',
      );
    });
  });

  describe('remove', () => {
    it('should remove a proposal', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('1', { user: { sub: 'user1' } });

      expect(service.remove).toHaveBeenCalledWith(1, 'user1');
    });
  });
});
