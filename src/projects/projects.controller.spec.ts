import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ProjectCategory, ProjectStatus } from './entities/project.entity';

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

const mockProjectsService = {
  create: jest.fn().mockResolvedValue(mockProject),
  findAll: jest.fn().mockResolvedValue([mockProject]),
  findOne: jest.fn().mockResolvedValue(mockProject),
  findByAuthor: jest.fn().mockResolvedValue([mockProject]),
  update: jest.fn().mockResolvedValue(mockProject),
  remove: jest.fn().mockResolvedValue(undefined),
  vote: jest.fn().mockResolvedValue({ ...mockProject, votesFor: 1 }),
};

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      const req = { user: { sub: 'user1' } };

      const result = await controller.create(createDto, req);
      expect(result).toEqual(mockProject);
      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        authorId: 'user1',
      });
    });
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockProject]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a project', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockProject);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findByAuthor', () => {
    it('should return projects by author', async () => {
      const result = await controller.findByAuthor('user1');
      expect(result).toEqual([mockProject]);
      expect(service.findByAuthor).toHaveBeenCalledWith('user1');
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { title: 'Updated Title' };
      const req = { user: { sub: 'user1' } };

      const result = await controller.update('1', updateDto, req);
      expect(result).toEqual(mockProject);
      expect(service.update).toHaveBeenCalledWith('1', updateDto, 'user1');
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      const req = { user: { sub: 'user1' } };
      await controller.remove('1', req);
      expect(service.remove).toHaveBeenCalledWith('1', 'user1');
    });
  });

  describe('vote', () => {
    it('should vote on a project', async () => {
      const result = await controller.vote('1', 'for');
      expect(result.votesFor).toBe(1);
      expect(service.vote).toHaveBeenCalledWith('1', 'for');
    });
  });
});
