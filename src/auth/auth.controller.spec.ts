import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KEYS, SignupUserDto } from './auth.dto';
import { ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
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
});
