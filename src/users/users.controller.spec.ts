import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ExecutionContext } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: '1',
    cpf: '13271936986',
    password: '3d4f5y62d',
  };

  const mockUsersService = {
    findByCpf: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByCpf', () => {
    it('should return a user by CPF', async () => {
      const cpf = '13271936986';
      mockUsersService.findByCpf.mockResolvedValue(mockUser);

      const result = await controller.findByCpf(cpf);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findByCpf).toHaveBeenCalledWith(cpf);
      expect(mockUsersService.findByCpf).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when user not found', async () => {
      const cpf = '99999999999';
      mockUsersService.findByCpf.mockResolvedValue(undefined);

      const result = await controller.findByCpf(cpf);

      expect(result).toBeUndefined();
      expect(mockUsersService.findByCpf).toHaveBeenCalledWith(cpf);
    });

    it('should handle empty CPF', async () => {
      mockUsersService.findByCpf.mockResolvedValue(undefined);

      const result = await controller.findByCpf('');

      expect(result).toBeUndefined();
      expect(mockUsersService.findByCpf).toHaveBeenCalledWith('');
    });

    it('should handle formatted CPF with dots and dash', async () => {
      const formattedCpf = '132.719.369-86';
      mockUsersService.findByCpf.mockResolvedValue(mockUser);

      const result = await controller.findByCpf(formattedCpf);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findByCpf).toHaveBeenCalledWith(formattedCpf);
    });

    it('should be protected by AuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', controller.findByCpf);
      expect(guards).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        mockUser,
        { id: '2', cpf: '98765432100', password: 'pass2' },
      ];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return array with single user', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUser);
    });

    it('should be protected by AuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', controller.findAll);
      expect(guards).toBeDefined();
    });

    it('should handle large number of users', async () => {
      const largeUserArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        cpf: `${i}`.padStart(11, '0'),
        password: `pass${i}`,
      }));
      mockUsersService.findAll.mockResolvedValue(largeUserArray);

      const result = await controller.findAll();

      expect(result).toHaveLength(1000);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        cpf: '98765432100',
        password: 'newpassword',
      };
      const savedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        cpf: '98765432100',
        password: '$2b$10$hashedPassword',
      };
      const { password, ...expectedResult } = savedUser;
      mockUsersService.create.mockResolvedValue(savedUser as any);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(result).not.toHaveProperty('password');
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });

    it('should create user with valid CPF format', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@test.com',
        name: 'John Doe',
        cpf: '12345678900',
        password: 'securepass',
      };
      mockUsersService.create.mockResolvedValue(createUserDto);

      const result = await controller.create(createUserDto);

      expect(result.cpf).toBe('12345678900');
    });

    it('should create user with complex password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'complex@test.com',
        name: 'Complex User',
        cpf: '11111111111',
        password: 'C0mpl3x!P@ssw0rd#123',
      };
      const savedUser = {
        id: '1',
        email: 'complex@test.com',
        name: 'Complex User',
        cpf: '11111111111',
        password: '$2b$10$hashedPassword',
      };
      mockUsersService.create.mockResolvedValue(savedUser as any);

      const result = await controller.create(createUserDto);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('complex@test.com');
    });

    it('should not require authentication (no AuthGuard)', () => {
      const guards = Reflect.getMetadata('__guards__', controller.create);
      expect(guards).toBeUndefined();
    });

    it('should handle empty password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'empty@test.com',
        name: 'Empty Pass User',
        cpf: '22222222222',
        password: '',
      };
      const savedUser = {
        id: '1',
        email: 'empty@test.com',
        name: 'Empty Pass User',
        cpf: '22222222222',
        password: '$2b$10$hashedPassword',
      };
      mockUsersService.create.mockResolvedValue(savedUser as any);

      const result = await controller.create(createUserDto);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('empty@test.com');
    });

    it('should handle multiple user creation calls', async () => {
      const users: CreateUserDto[] = [
        {
          email: 'user1@test.com',
          name: 'User 1',
          cpf: '11111111111',
          password: 'pass1',
        },
        {
          email: 'user2@test.com',
          name: 'User 2',
          cpf: '22222222222',
          password: 'pass2',
        },
        {
          email: 'user3@test.com',
          name: 'User 3',
          cpf: '33333333333',
          password: 'pass3',
        },
      ];

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const savedUser = {
          id: `${i + 1}`,
          email: user.email,
          name: user.name,
          cpf: user.cpf,
          password: '$2b$10$hashedPassword',
        };
        const { password, ...expectedResult } = savedUser;
        mockUsersService.create.mockResolvedValue(savedUser as any);
        const result = await controller.create(user);
        expect(result).toEqual(expectedResult);
        expect(result).not.toHaveProperty('password');
      }

      expect(mockUsersService.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors on findByCpf', async () => {
      mockUsersService.findByCpf.mockRejectedValue(new Error('Database error'));

      await expect(controller.findByCpf('13271936986')).rejects.toThrow(
        'Database error',
      );
    });

    it('should propagate service errors on findAll', async () => {
      mockUsersService.findAll.mockRejectedValue(new Error('Connection error'));

      await expect(controller.findAll()).rejects.toThrow('Connection error');
    });

    it('should propagate service errors on create', async () => {
      const createUserDto: CreateUserDto = {
        email: 'error@test.com',
        name: 'Error User',
        cpf: '12345678900',
        password: 'password',
      };
      mockUsersService.create.mockRejectedValue(new Error('Validation error'));

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Validation error',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null CPF parameter', async () => {
      mockUsersService.findByCpf.mockResolvedValue(undefined);

      const result = await controller.findByCpf(null as any);

      expect(result).toBeUndefined();
    });

    it('should handle special characters in CPF', async () => {
      const specialCpf = '123@456#789$00';
      mockUsersService.findByCpf.mockResolvedValue(undefined);

      const result = await controller.findByCpf(specialCpf);

      expect(mockUsersService.findByCpf).toHaveBeenCalledWith(specialCpf);
    });

    it('should handle very long CPF string', async () => {
      const longCpf = '1'.repeat(1000);
      mockUsersService.findByCpf.mockResolvedValue(undefined);

      await controller.findByCpf(longCpf);

      expect(mockUsersService.findByCpf).toHaveBeenCalledWith(longCpf);
    });
  });
});
