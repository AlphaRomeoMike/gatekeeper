import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KEYS, SignupUserDto } from './auth.dto';
import { ConflictException } from '@nestjs/common';
import { ValidatedRequest } from 'src/interfaces/request.interface';
import { JwtGuard } from './jwt.guard';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    validate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('your-secret-value'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
            signAsync: jest.fn(),
          },
        },
        JwtGuard,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Signup', () => {
    it('should successfully sign up a user', async () => {
      const signupUserDto: SignupUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const result = { ...signupUserDto, password: undefined };

      mockAuthService.signup.mockResolvedValue(result);

      const response = await controller.signup(signupUserDto);

      expect(response).toEqual(result);
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupUserDto);
    });

    it('should throw ConflictException if signup fails', async () => {
      const signupUserDto: SignupUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      mockAuthService.signup.mockRejectedValue(
        new ConflictException(KEYS.ALREADYEXISTS),
      );

      await expect(controller.signup(signupUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupUserDto);
    });
  });

  describe('signin', () => {
    it('should return a token on successful login', async () => {
      const credentials = { email: 'user@example.com', password: 'password' };
      const token = 'dummy-token';
      jest.spyOn(service, 'login').mockResolvedValue(token);

      const result = await controller.signin(credentials);
      expect(result).toEqual({ token });
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(service.login).toHaveBeenCalledWith(credentials);
    });

    it('should throw an error if login fails', async () => {
      const credentials = { email: 'user@example.com', password: 'password' };
      jest.spyOn(service, 'login').mockRejectedValue(new Error('Login failed'));

      await expect(controller.signin(credentials)).rejects.toThrowError(
        'Login failed',
      );
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(service.login).toHaveBeenCalledWith(credentials);
    });
  });

  describe('validate', () => {
    it('should return the validated user', async () => {
      const userId = 1;
      const validatedUser = { id: userId, name: 'Test User' };

      (service.validate as jest.Mock).mockResolvedValue(validatedUser);

      const request: ValidatedRequest = {
        user: { id: userId },
      } as any;

      const result = await controller.validate(request);

      expect(result).toEqual({ user: validatedUser });
      expect(service.validate).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if validation fails', async () => {
      const userId = 1;
      const error = new Error('Validation failed');

      (service.validate as jest.Mock).mockRejectedValue(error);

      const request: ValidatedRequest = {
        user: { id: userId },
      } as any;

      await expect(controller.validate(request)).rejects.toThrowError(error);
      expect(service.validate).toHaveBeenCalledWith(userId);
    });
  });
});
