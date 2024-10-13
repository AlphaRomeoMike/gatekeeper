import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtGuard>(JwtGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if token is valid', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer valid.token.here',
          },
        }),
      }),
    } as ExecutionContext;

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ userId: 1 });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access if token is invalid', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid.token.here',
          },
        }),
      }),
    } as ExecutionContext;

    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('Invalid token'),
    );

    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it('should deny access if no token is provided', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow();
  });
});
