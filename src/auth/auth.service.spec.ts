import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    cpf: '13271936986',
    password: '3d4f5y62d',
  };

  const mockUsersService = {
    findByCpf: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('citizenLogin', () => {
    it('should return access token for valid credentials', async () => {
      const cpf = '13271936986';
      const password = '3d4f5y62d';
      const expectedToken = 'mock.jwt.token';

      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.citizenLogin(cpf, password);

      expect(result).toEqual({ access_token: expectedToken });
      expect(mockUsersService.findByCpf).toHaveBeenCalledWith(cpf);
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        cpf,
        password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser.id },
        expect.objectContaining({
          secret: expect.any(String),
          expiresIn: '1h',
        }),
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const cpf = '99999999999';
      const password = 'anypassword';

      mockUsersService.findByCpf.mockResolvedValue(null);

      await expect(service.citizenLogin(cpf, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findByCpf).toHaveBeenCalledWith(cpf);
      expect(mockUsersService.validatePassword).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const cpf = '13271936986';
      const password = 'wrongpassword';

      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(service.citizenLogin(cpf, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findByCpf).toHaveBeenCalledWith(cpf);
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        cpf,
        password,
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with proper description', async () => {
      mockUsersService.findByCpf.mockResolvedValue(null);

      await expect(service.citizenLogin('12345678900', 'pass')).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            description: 'Credenciais inválidas.',
          }),
        }),
      );
    });

    it('should handle empty CPF', async () => {
      mockUsersService.findByCpf.mockResolvedValue(null);

      await expect(service.citizenLogin('', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle empty password', async () => {
      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(service.citizenLogin('13271936986', '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should generate token with correct payload structure', async () => {
      const cpf = '13271936986';
      const password = '3d4f5y62d';

      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      await service.citizenLogin(cpf, password);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: '1' },
        expect.any(Object),
      );
    });

    it('should handle JWT signing errors', async () => {
      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockRejectedValue(new Error('JWT Error'));

      await expect(
        service.citizenLogin('13271936986', '3d4f5y62d'),
      ).rejects.toThrow('JWT Error');
    });
  });

  describe('coucilorLogin', () => {
    it('should return access token for valid councilor credentials', async () => {
      const cpf = '13271936986';
      const password = '3d4f5y62d';
      const expectedToken = 'mock.councilor.jwt.token';

      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.coucilorLogin(cpf, password);

      expect(result).toEqual({ access_token: expectedToken });
      expect(mockUsersService.findByCpf).toHaveBeenCalledWith(cpf);
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        cpf,
        password,
      );
    });

    it('should throw UnauthorizedException when councilor not found', async () => {
      mockUsersService.findByCpf.mockResolvedValue(null);

      await expect(
        service.coucilorLogin('99999999999', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid councilor password', async () => {
      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(
        service.coucilorLogin('13271936986', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should generate same token structure as citizenLogin', async () => {
      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      await service.coucilorLogin('13271936986', '3d4f5y62d');

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: '1' },
        expect.objectContaining({
          secret: expect.any(String),
          expiresIn: '1h',
        }),
      );
    });

    it('should handle empty credentials', async () => {
      mockUsersService.findByCpf.mockResolvedValue(null);

      await expect(service.coucilorLogin('', '')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined user response', async () => {
      mockUsersService.findByCpf.mockResolvedValue(undefined);

      await expect(
        service.citizenLogin('12345678900', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle special characters in credentials', async () => {
      const specialCpf = '123.456.789-00';
      const specialPassword = '!@#$%^&*()';

      mockUsersService.findByCpf.mockResolvedValue(null);

      await expect(
        service.citizenLogin(specialCpf, specialPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle very long password strings', async () => {
      const longPassword = 'a'.repeat(10000);

      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(
        service.citizenLogin('13271936986', longPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle concurrent login attempts', async () => {
      mockUsersService.findByCpf.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      const promises = [
        service.citizenLogin('13271936986', '3d4f5y62d'),
        service.citizenLogin('13271936986', '3d4f5y62d'),
        service.coucilorLogin('13271936986', '3d4f5y62d'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toHaveProperty('access_token');
      });
    });
  });
});
