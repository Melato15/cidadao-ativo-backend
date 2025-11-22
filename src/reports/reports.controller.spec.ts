import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import {
  ReportCategory,
  ReportStatus,
  ReportPriority,
} from './entities/report.entity';

const mockReport = {
  id: 1,
  title: 'Test Report',
  description: 'Test Description',
  category: ReportCategory.HEALTH,
  status: ReportStatus.ACTIVE,
  priority: ReportPriority.MEDIUM,
  authorId: 'user1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReportsService = {
  create: jest.fn().mockResolvedValue(mockReport),
  findAll: jest.fn().mockResolvedValue([mockReport]),
  findOne: jest.fn().mockResolvedValue(mockReport),
  findByAuthor: jest.fn().mockResolvedValue([mockReport]),
  update: jest.fn().mockResolvedValue(mockReport),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
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

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a report', async () => {
      const createDto = {
        title: 'Test Report',
        description: 'Test Description',
        category: ReportCategory.HEALTH,
        status: ReportStatus.ACTIVE,
        priority: ReportPriority.MEDIUM,
        location: 'Rua Teste',
        authorId: 'user1',
      };
      const req = { user: { sub: 'user1' } };

      const result = await controller.create(createDto, req);
      expect(result).toEqual(mockReport);
      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        authorId: 'user1',
      });
    });
  });

  describe('findAll', () => {
    it('should return all reports', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockReport]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a report', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockReport);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByAuthor', () => {
    it('should return reports by author', async () => {
      const result = await controller.findByAuthor('user1');
      expect(result).toEqual([mockReport]);
      expect(service.findByAuthor).toHaveBeenCalledWith('user1');
    });
  });

  describe('update', () => {
    it('should update a report', async () => {
      const updateDto = { title: 'Updated Title' };
      const req = { user: { sub: 'user1' } };

      const result = await controller.update('1', updateDto, req);
      expect(result).toEqual(mockReport);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, 'user1');
    });
  });

  describe('remove', () => {
    it('should remove a report', async () => {
      const req = { user: { sub: 'user1' } };
      await controller.remove('1', req);
      expect(service.remove).toHaveBeenCalledWith(1, 'user1');
    });
  });
});
