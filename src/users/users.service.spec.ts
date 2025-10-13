import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Reset users array to default state before each test
    service.users.length = 0;
    service.users.push({
      id: '1',
      cpf: '13271936986',
      password: '3d4f5y62d',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByCpf', () => {
    it('should return a user when CPF exists', async () => {
      const result = await service.findByCpf('13271936986');

      expect(result).toBeDefined();
      expect(result?.cpf).toBe('13271936986');
      expect(result?.id).toBe('1');
    });

    it('should return undefined when CPF does not exist', async () => {
      const result = await service.findByCpf('99999999999');

      expect(result).toBeUndefined();
    });

    it('should handle empty CPF string', async () => {
      const result = await service.findByCpf('');

      expect(result).toBeUndefined();
    });

    it('should handle malformed CPF', async () => {
      const result = await service.findByCpf('invalid-cpf');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return a user when ID exists', async () => {
      const result = await service.findById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.cpf).toBe('13271936986');
    });

    it('should return undefined when ID does not exist', async () => {
      const result = await service.findById('999');

      expect(result).toBeUndefined();
    });

    it('should handle empty ID string', async () => {
      const result = await service.findById('');

      expect(result).toBeUndefined();
    });

    it('should handle numeric ID as string', async () => {
      const result = await service.findById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('should return empty array when no users exist', async () => {
      service.users.length = 0;
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

      const result = await service.create(newUser);

      expect(result).toBeDefined();
      expect(result.cpf).toBe(newUser.cpf);
      expect(result.password).toBe(newUser.password);
    });

    it('should add user to users array', async () => {
      const initialLength = service.users.length;
      const newUser: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
        cpf: '98765432100',
        password: 'testpass123',
      };

      await service.create(newUser);

      expect(service.users.length).toBe(initialLength + 1);
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

      await service.create(newUser1);
      // Add small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
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

      const result = await service.create(newUser);

      expect(result).toBeDefined();
      expect(result.password).toBe('');
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

      for (const user of users) {
        await service.create(user);
      }

      const allUsers = await service.findAll();
      expect(allUsers.length).toBe(4); // 1 initial + 3 new
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid credentials', async () => {
      const result = await service.validatePassword('13271936986', '3d4f5y62d');

      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const result = await service.validatePassword(
        '13271936986',
        'wrongpassword',
      );

      expect(result).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const result = await service.validatePassword(
        '99999999999',
        'anypassword',
      );

      expect(result).toBe(false);
    });

    it('should return false for empty CPF', async () => {
      const result = await service.validatePassword('', '3d4f5y62d');

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const result = await service.validatePassword('13271936986', '');

      expect(result).toBe(false);
    });

    it('should return false for both empty credentials', async () => {
      const result = await service.validatePassword('', '');

      expect(result).toBe(false);
    });

    it('should handle password case sensitivity', async () => {
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

      await service.create(newUser);
      const result = await service.validatePassword(
        '44444444444',
        '!@#$%^&*()',
      );

      expect(result).toBe(true);
    });

    it('should handle very long CPF', async () => {
      const longCpf = '1234567890123456789';
      const result = await service.findByCpf(longCpf);

      expect(result).toBeUndefined();
    });

    it('should handle null-like values gracefully', async () => {
      const result1 = await service.findByCpf(null as any);
      const result2 = await service.findById(undefined as any);

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
    });
  });
});
