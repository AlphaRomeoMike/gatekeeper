import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SignupUserDto } from './auth.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const mockRepo = {
  exists: jest.fn(),
  save: jest.fn(),
  create: jest.fn((user) => user),
  findOneBy: jest.fn(),
};

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let repo: Repository<User>;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn() as unknown as JwtService,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Exists', () => {
    it('should return true if user exists', async () => {
      mockRepo.exists.mockResolvedValue(true);

      const result = await service.userExists('test@example.com');

      expect(result).toBe(true);
      expect(mockRepo.exists).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
        },
      });
    });

    it('should return false if user does not exist', async () => {
      mockRepo.exists.mockResolvedValue(false);

      const result = await service.userExists('test@example.com');

      expect(result).toBe(false);
      expect(mockRepo.exists).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('Signup', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let userExistsSpy;

    beforeEach(() => {
      userExistsSpy = jest.spyOn(service, 'userExists');
    });

    afterEach(() => {
      userExistsSpy.mockRestore();
    });

    it('should throw conflict exception if user exists', async () => {
      const _user: SignupUserDto = {
        email: 'test@example.com',
        password: 'Password123@1231__',
        name: 'Random Name',
      };

      userExistsSpy.mockResolvedValueOnce(true);
      await expect(service.signup(_user)).rejects.toThrow(ConflictException);
    });

    it('should successfully create a new user', async () => {
      const _user: SignupUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Random Name',
      };

      userExistsSpy.mockResolvedValueOnce(false);
      mockRepo.save.mockResolvedValueOnce(_user);

      const result = await service.signup(_user);

      expect(result).toEqual(_user);
      expect(userExistsSpy).toHaveBeenCalledWith(_user.email);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should hash the password before saving', async () => {
      const _user: SignupUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Random String',
      };

      userExistsSpy.mockResolvedValueOnce(false);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');

      await service.signup(_user);

      expect(repo.save).toHaveBeenCalledWith({
        ..._user,
        password: 'hashedPassword',
      });

      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      jest.spyOn(bcrypt, 'compare');
    });

    it('should throw not found exception if user is not found', async () => {
      const credentials: Omit<SignupUserDto, 'name'> = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(service, 'userExists').mockResolvedValue(false);

      await expect(service.login(credentials)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if password is incorrect', async () => {
      const credentials: Omit<SignupUserDto, 'name'> = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 1,
        email: credentials.email,
        password: 'hashedPassword',
      };

      jest.spyOn(service, 'userExists').mockResolvedValueOnce(true);
      mockRepo.findOneBy.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login(credentials)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return a token on successful login', async () => {
      const credentials: Omit<SignupUserDto, 'name'> = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 1,
        email: credentials.email,
        password: 'hashedPassword',
      };

      jest.spyOn(service, 'userExists').mockResolvedValueOnce(true);
      mockRepo.findOneBy.mockResolvedValueOnce(user);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      (jwt.signAsync as jest.Mock).mockResolvedValueOnce('token');
      const result = await service.login(credentials);

      expect(result).toEqual('token');
      expect(jwt.signAsync).toHaveBeenCalledWith({ id: user.id });
    });
  });
});
