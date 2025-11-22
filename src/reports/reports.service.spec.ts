import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

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

const mockReportsRepository = {
  create: jest.fn().mockReturnValue(mockReport),
  save: jest.fn().mockReturnValue(mockReport),
  find: jest.fn().mockReturnValue([mockReport]),
  findOne: jest.fn().mockReturnValue(mockReport),
  update: jest.fn().mockReturnValue({ affected: 1 }),
  delete: jest.fn().mockReturnValue({ affected: 1 }),
};

describe('ReportsService', () => {
  let service: ReportsService;
  let repository: Repository<Report>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Report),
          useValue: mockReportsRepository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    repository = module.get<Repository<Report>>(getRepositoryToken(Report));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      const result = await service.create(createDto);
      expect(result).toEqual(mockReport);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of reports', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockReport]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a report by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockReport);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
    });

    it('should throw NotFoundException if report not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAuthor', () => {
    it('should return reports by author', async () => {
      const result = await service.findByAuthor('user1');
      expect(result).toEqual([mockReport]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { authorId: 'user1' },
        relations: ['author'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('update', () => {
    it('should update a report', async () => {
      const updateDto = { title: 'Updated Title' };
      const result = await service.update(1, updateDto, 'user1');
      expect(result).toEqual(mockReport);
      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      const updateDto = { title: 'Updated Title' };
      await expect(service.update(1, updateDto, 'user2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a report', async () => {
      await service.remove(1, 'user1');
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      await expect(service.remove(1, 'user2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
