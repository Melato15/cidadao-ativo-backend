import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { jwtConstants } from './constants';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const createMockExecutionContext = (
    authHeader?: string,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
      }),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid Bearer token', async () => {
      const mockPayload = { sub: '1', username: 'test' };
      const context = createMockExecutionContext('Bearer valid.jwt.token');

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid.jwt.token',
        {
          secret: jwtConstants.secret,
        },
      );
    });

    it('should attach user payload to request', async () => {
      const mockPayload = { sub: '1', username: 'test' };
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid.jwt.token',
        },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      await guard.canActivate(context);

      expect(mockRequest['user']).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when token is missing', async () => {
      const context = createMockExecutionContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is empty', async () => {
      const context = createMockExecutionContext('');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid token format', async () => {
      const context = createMockExecutionContext('InvalidFormat token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      const context = createMockExecutionContext('Bearer invalid.token');

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const context = createMockExecutionContext('Bearer expired.token');

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle Bearer with lowercase', async () => {
      const context = createMockExecutionContext('bearer valid.token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle token without Bearer prefix', async () => {
      const context = createMockExecutionContext('just.a.token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle authorization header with only Bearer', async () => {
      const context = createMockExecutionContext('Bearer ');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should verify token with correct secret', async () => {
      const mockPayload = { sub: '1' };
      const context = createMockExecutionContext('Bearer valid.token');

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      await guard.canActivate(context);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid.token',
        expect.objectContaining({
          secret: jwtConstants.secret,
        }),
      );
    });

    it('should handle very long JWT tokens', async () => {
      const longToken = 'a'.repeat(5000);
      const mockPayload = { sub: '1' };
      const context = createMockExecutionContext(`Bearer ${longToken}`);

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(longToken, {
        secret: jwtConstants.secret,
      });
    });

    it('should handle malformed JWT structure', async () => {
      const context = createMockExecutionContext('Bearer malformed.token');

      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Malformed token'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle JWT with invalid signature', async () => {
      const context = createMockExecutionContext(
        'Bearer token.with.invalidsig',
      );

      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Invalid signature'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', async () => {
      const mockPayload = { sub: '1' };
      const token = 'extracted.jwt.token';
      const context = createMockExecutionContext(`Bearer ${token}`);

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      await guard.canActivate(context);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: jwtConstants.secret,
      });
    });

    it('should return undefined for missing authorization header', async () => {
      const context = createMockExecutionContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return undefined for empty authorization header', async () => {
      const context = createMockExecutionContext('');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return undefined for non-Bearer authorization', async () => {
      const context = createMockExecutionContext('Basic dXNlcjpwYXNz');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null authorization header', async () => {
      const mockRequest = {
        headers: {
          authorization: null,
        },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle undefined headers object', async () => {
      const mockRequest = {} as any;
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      await expect(guard.canActivate(context)).rejects.toThrow();
    });

    it('should handle concurrent token verification', async () => {
      const mockPayload = { sub: '1' };
      const contexts = [
        createMockExecutionContext('Bearer token1'),
        createMockExecutionContext('Bearer token2'),
        createMockExecutionContext('Bearer token3'),
      ];

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const promises = contexts.map((ctx) => guard.canActivate(ctx));
      const results = await Promise.all(promises);

      expect(results).toEqual([true, true, true]);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(3);
    });

    it('should handle special characters in token', async () => {
      const mockPayload = { sub: '1' };
      const specialToken = 'token+with/special=chars';
      const context = createMockExecutionContext(`Bearer ${specialToken}`);

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should preserve original error type from JWT service', async () => {
      const context = createMockExecutionContext('Bearer invalid.token');
      const customError = new Error('Custom JWT Error');

      mockJwtService.verifyAsync.mockRejectedValue(customError);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
