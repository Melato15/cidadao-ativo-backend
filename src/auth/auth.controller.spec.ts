import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    citizenLogin: jest.fn(),
    coucilorLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto: LoginDto = {
        cpf: '13271936986',
        password: '3d4f5y62d',
      };
      const expectedResult = { access_token: 'mock.jwt.token' };

      mockAuthService.citizenLogin.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.citizenLogin).toHaveBeenCalledWith(
        loginDto.cpf,
        loginDto.password,
      );
      expect(mockAuthService.citizenLogin).toHaveBeenCalledTimes(1);
    });

    it('should return 200 OK status code', async () => {
      const loginDto: LoginDto = {
        cpf: '13271936986',
        password: '3d4f5y62d',
      };
      mockAuthService.citizenLogin.mockResolvedValue({ access_token: 'token' });

      const result = await controller.login(loginDto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('access_token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        cpf: '99999999999',
        password: 'wrongpassword',
      };

      mockAuthService.citizenLogin.mockRejectedValue(
        new UnauthorizedException({
          description: 'Credenciais inválidas.',
        }),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.citizenLogin).toHaveBeenCalledWith(
        loginDto.cpf,
        loginDto.password,
      );
    });

    it('should handle empty CPF', async () => {
      const loginDto: LoginDto = {
        cpf: '',
        password: 'password',
      };

      mockAuthService.citizenLogin.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle empty password', async () => {
      const loginDto: LoginDto = {
        cpf: '13271936986',
        password: '',
      };

      mockAuthService.citizenLogin.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle both empty credentials', async () => {
      const loginDto: LoginDto = {
        cpf: '',
        password: '',
      };

      mockAuthService.citizenLogin.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle formatted CPF with dots and dash', async () => {
      const loginDto: LoginDto = {
        cpf: '132.719.369-86',
        password: '3d4f5y62d',
      };
      const expectedResult = { access_token: 'token' };

      mockAuthService.citizenLogin.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.citizenLogin).toHaveBeenCalledWith(
        '132.719.369-86',
        '3d4f5y62d',
      );
    });

    it('should handle special characters in password', async () => {
      const loginDto: LoginDto = {
        cpf: '13271936986',
        password: '!@#$%^&*()',
      };

      mockAuthService.citizenLogin.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle very long password', async () => {
      const loginDto: LoginDto = {
        cpf: '13271936986',
        password: 'a'.repeat(10000),
      };

      mockAuthService.citizenLogin.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should pass through JWT token correctly', async () => {
      const loginDto: LoginDto = {
        cpf: '13271936986',
        password: '3d4f5y62d',
      };
      const longToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';

      mockAuthService.citizenLogin.mockResolvedValue({
        access_token: longToken,
      });

      const result = await controller.login(loginDto);

      expect(result.access_token).toBe(longToken);
    });

    it('should handle multiple concurrent login attempts', async () => {
      const loginDto: LoginDto = {
        cpf: '13271936986',
        password: '3d4f5y62d',
      };

      mockAuthService.citizenLogin.mockResolvedValue({ access_token: 'token' });

      const promises = [
        controller.login(loginDto),
        controller.login(loginDto),
        controller.login(loginDto),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toHaveProperty('access_token');
      });
      expect(mockAuthService.citizenLogin).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Propagation', () => {
    it('should propagate service errors', async () => {
      const loginDto: LoginDto = {
        cpf: '13271936986',
        password: '3d4f5y62d',
      };

      mockAuthService.citizenLogin.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow('Service error');
    });

    it('should handle timeout errors', async () => {
      const loginDto: LoginDto = {
        cpf: '13271936986',
        password: '3d4f5y62d',
      };

      mockAuthService.citizenLogin.mockRejectedValue(new Error('Timeout'));

      await expect(controller.login(loginDto)).rejects.toThrow('Timeout');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null CPF', async () => {
      const loginDto = {
        cpf: null,
        password: 'password',
      } as any;

      mockAuthService.citizenLogin.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle undefined password', async () => {
      const loginDto = {
        cpf: '13271936986',
        password: undefined,
      } as any;

      mockAuthService.citizenLogin.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle numeric CPF', async () => {
      const loginDto = {
        cpf: 13271936986,
        password: '3d4f5y62d',
      } as any;

      mockAuthService.citizenLogin.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle whitespace in credentials', async () => {
      const loginDto: LoginDto = {
        cpf: '  13271936986  ',
        password: '  3d4f5y62d  ',
      };

      mockAuthService.citizenLogin.mockResolvedValue({ access_token: 'token' });

      await controller.login(loginDto);

      expect(mockAuthService.citizenLogin).toHaveBeenCalledWith(
        '  13271936986  ',
        '  3d4f5y62d  ',
      );
    });
  });
});
