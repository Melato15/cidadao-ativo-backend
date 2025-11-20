import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$mockHashedPassword'),
  compare: jest.fn((pass, hash) => Promise.resolve(pass === '3d4f5y62d')),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser = {
    id: '1',
    cpf: '13271936986',
    password: '$2b$10$mockHashedPassword',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByCpf', () => {
    it('should return a user when CPF exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByCpf('13271936986');

      expect(result).toBeDefined();
      expect(result?.cpf).toBe('13271936986');
      expect(result?.id).toBe('1');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpf: '13271936986' },
      });
    });

    it('should return null when CPF does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findByCpf('99999999999');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user when ID exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.cpf).toBe('13271936986');
    });

    it('should return null when ID does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockRepository.find.mockResolvedValue([mockUser]);
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const newUser: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
        cpf: '98765432100',
        password: 'testpass123',
      };
      const savedUser = {
        ...newUser,
        id: '2',
        password: '$2b$10$mockHashedPassword',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser as any);
      mockRepository.save.mockResolvedValue(savedUser as any);

      const result = await service.create(newUser);

      expect(result).toBeDefined();
      expect(result.cpf).toBe(newUser.cpf);
      expect(result.password).toBe('$2b$10$mockHashedPassword');
      expect(result.password).not.toBe('testpass123');
    });

    it('should throw ConflictException when email already exists', async () => {
      const newUser: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        cpf: '98765432100',
        password: 'testpass123',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(newUser)).rejects.toThrow(ConflictException);
      await expect(service.create(newUser)).rejects.toThrow(
        'Email já cadastrado',
      );
    });

    it('should throw ConflictException when CPF already exists', async () => {
      const newUser: CreateUserDto = {
        email: 'another@example.com',
        name: 'Another User',
        cpf: '13271936986',
        password: 'testpass123',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(service.create(newUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid credentials', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.validatePassword('13271936986', '3d4f5y62d');

      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.validatePassword(
        '13271936986',
        'wrongpassword',
      );

      expect(result).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.validatePassword(
        '99999999999',
        'anypassword',
      );

      expect(result).toBe(false);
    });
  });
});
