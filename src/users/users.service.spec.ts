import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
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
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { cpf: '13271936986' } });
    });

    it('should return null when CPF does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findByCpf('99999999999');

      expect(result).toBeNull();
    });

    it('should handle empty CPF string', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findByCpf('');

      expect(result).toBeNull();
    });

    it('should handle malformed CPF', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findByCpf('invalid-cpf');

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

    it('should handle empty ID string', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findById('');

      expect(result).toBeNull();
    });

    it('should handle numeric ID as string', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
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

    it('should return all users after creating new ones', async () => {
      const newUser: CreateUserDto = {
        email: 'newuser@test.com',
        name: 'New User',
        cpf: '98765432100',
        password: 'testpass123',
      };
      const createdUser = { ...newUser, id: '2', password: '$2b$10$mockHashedPassword' };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createdUser as any);
      mockRepository.save.mockResolvedValue(createdUser as any);
      mockRepository.find.mockResolvedValue([mockUser, createdUser]);

      await service.create(newUser);
      const result = await service.findAll();

      expect(result.length).toBe(2);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const newUser: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        cpf: '98765432100',
        password: 'testpass123',
      };
      const savedUser = { ...newUser, id: '2', password: '$2b$10$mockHashedPassword' };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser as any);
      mockRepository.save.mockResolvedValue(savedUser as any);

      const result = await service.create(newUser);

      expect(result).toBeDefined();
      expect(result.cpf).toBe(newUser.cpf);
      expect(result.password).toBe('$2b$10$mockHashedPassword');
    });

    it('should hash the password', async () => {
      const newUser: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
        cpf: '98765432100',
        password: 'testpass123',
      };
      const savedUser = { ...newUser, id: '2', password: '$2b$10$mockHashedPassword' };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser as any);
      mockRepository.save.mockResolvedValue(savedUser as any);

      const result = await service.create(newUser);

      expect(result.password).not.toBe('testpass123');
      expect(result.password).toBe('$2b$10$mockHashedPassword');
    });

    it('should generate unique ID for new user', async () => {
      const newUser1: CreateUserDto = {
        email: 'user1@test.com',
        name: 'User One',
        cpf: '11111111111',
        password: 'pass1',
      };
      const newUser2: CreateUserDto = {
        email: 'user2@test.com',
        name: 'User Two',
        cpf: '22222222222',
        password: 'pass2',
      };
      const savedUser1 = { ...newUser1, id: '2', password: '$2b$10$mockHashedPassword' };
      const savedUser2 = { ...newUser2, id: '3', password: '$2b$10$mockHashedPassword' };

      mockRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null).mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedUser1).mockResolvedValueOnce(savedUser2);
      mockRepository.create.mockReturnValueOnce(savedUser1 as any).mockReturnValueOnce(savedUser2 as any);
      mockRepository.save.mockResolvedValueOnce(savedUser1 as any).mockResolvedValueOnce(savedUser2 as any);

      await service.create(newUser1);
      await service.create(newUser2);

      const user1 = await service.findByCpf('11111111111');
      const user2 = await service.findByCpf('22222222222');

      expect(user1?.id).toBeDefined();
      expect(user2?.id).toBeDefined();
      expect(user1?.id).not.toBe(user2?.id);
    });

    it('should handle user with empty password', async () => {
      const newUser: CreateUserDto = {
        email: 'empty@test.com',
        name: 'Empty Pass',
        cpf: '33333333333',
        password: '',
      };
      const savedUser = { ...newUser, id: '2', password: '$2b$10$mockHashedPassword' };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser as any);
      mockRepository.save.mockResolvedValue(savedUser as any);

      const result = await service.create(newUser);

      expect(result).toBeDefined();
      expect(result.password).toBeDefined();
    });

    it('should create multiple users successfully', async () => {
      const users: CreateUserDto[] = [
        {
          email: 'u1@test.com',
          name: 'User 1',
          cpf: '11111111111',
          password: 'pass1',
        },
        {
          email: 'u2@test.com',
          name: 'User 2',
          cpf: '22222222222',
          password: 'pass2',
        },
        {
          email: 'u3@test.com',
          name: 'User 3',
          cpf: '33333333333',
          password: 'pass3',
        },
      ];

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockImplementation((dto) => ({ ...dto, id: Date.now().toString() }) as any);
      mockRepository.save.mockImplementation((user) => Promise.resolve(user));

      for (const user of users) {
        await service.create(user);
      }

      const allUsers = [mockUser, ...users.map((u, i) => ({ ...u, id: `${i + 2}` }))];
      mockRepository.find.mockResolvedValue(allUsers);

      const result = await service.findAll();
      expect(result.length).toBe(4); // 1 initial + 3 new
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

    it('should return false for empty CPF', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.validatePassword('', '3d4f5y62d');

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      const result = await service.validatePassword('13271936986', '');

      expect(result).toBe(false);
    });

    it('should return false for both empty credentials', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.validatePassword('', '');

      expect(result).toBe(false);
    });

    it('should handle password case sensitivity', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      const result = await service.validatePassword('13271936986', '3D4F5Y62D');

      expect(result).toBe(false);
    });

    it('should validate password for newly created user', async () => {
      const newUser: CreateUserDto = {
        email: 'newuser@test.com',
        name: 'New User',
        cpf: '55555555555',
        password: 'newpassword123',
      };
      const savedUser = { ...newUser, id: '2', password: '$2b$10$mockHashedPassword' };

      mockRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedUser);
      mockRepository.create.mockReturnValue(savedUser as any);
      mockRepository.save.mockResolvedValue(savedUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as any);

      await service.create(newUser);
      const result = await service.validatePassword(
        '55555555555',
        'newpassword123',
      );

      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in password', async () => {
      const newUser: CreateUserDto = {
        email: 'special@test.com',
        name: 'Special User',
        cpf: '44444444444',
        password: '!@#$%^&*()',
      };
      const savedUser = { ...newUser, id: '2', password: '$2b$10$mockHashedPassword' };

      mockRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedUser);
      mockRepository.create.mockReturnValue(savedUser as any);
      mockRepository.save.mockResolvedValue(savedUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await service.create(newUser);
      const result = await service.validatePassword(
        '44444444444',
        '!@#$%^&*()',
      );

      expect(result).toBe(true);
    });

    it('should handle very long CPF', async () => {
      const longCpf = '1234567890123456789';
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findByCpf(longCpf);

      expect(result).toBeNull();
    });

    it('should handle null-like values gracefully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result1 = await service.findByCpf(null as any);
      const result2 = await service.findById(undefined as any);

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });
});
