import { Test, TestingModule } from '@nestjs/testing';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { VoteType } from './entities/vote.entity';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('VotesController', () => {
  let controller: VotesController;
  let service: VotesService;

  const mockVote = {
    id: '1',
    userId: 'user1',
    projectId: 'project1',
    type: VoteType.UP,
    comment: 'Great',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VotesController],
      providers: [
        {
          provide: VotesService,
          useValue: {
            vote: jest.fn(),
            removeVote: jest.fn(),
            getUserVotes: jest.fn(),
            getProjectVotes: jest.fn(),
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

    controller = module.get<VotesController>(VotesController);
    service = module.get<VotesService>(VotesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('vote', () => {
    it('should create/update a vote', async () => {
      jest.spyOn(service, 'vote').mockResolvedValue(mockVote as any);

      const result = await controller.vote(
        'project1',
        { type: 'up', comment: 'Great' } as any,
        { user: { sub: 'user1' } },
      );

      expect(result).toEqual(mockVote);
      expect(service.vote).toHaveBeenCalledWith(
        'user1',
        'project1',
        VoteType.UP,
        'Great',
      );
    });
  });

  describe('removeVote', () => {
    it('should remove a vote', async () => {
      jest.spyOn(service, 'removeVote').mockResolvedValue(undefined);

      await controller.removeVote('project1', { user: { sub: 'user1' } });

      expect(service.removeVote).toHaveBeenCalledWith('user1', 'project1');
    });
  });

  describe('getMyVotes', () => {
    it('should return user votes', async () => {
      jest.spyOn(service, 'getUserVotes').mockResolvedValue([mockVote] as any);

      const result = await controller.getMyVotes({ user: { sub: 'user1' } });

      expect(result).toEqual([mockVote]);
      expect(service.getUserVotes).toHaveBeenCalledWith('user1');
    });
  });

  describe('getProjectVotes', () => {
    it('should return project votes', async () => {
      jest
        .spyOn(service, 'getProjectVotes')
        .mockResolvedValue([mockVote] as any);

      const result = await controller.getProjectVotes('project1');

      expect(result).toEqual([mockVote]);
      expect(service.getProjectVotes).toHaveBeenCalledWith('project1');
    });
  });
});
