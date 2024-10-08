import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserCreateDto } from './user.dto';
import { HttpException } from '@nestjs/common';
import { USER_KEYS } from './user.key';
import * as bcrypt from 'bcrypt';

const mockUser: UserCreateDto = {
  email: 'test@example.com',
  full_name: 'Test User',
  password_hash: 'hashed_password',
};

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UserService', () => {
  let _service: UserService;
  let _repo: Repository<User>;

  beforeEach(async () => {
    const _module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        ConfigService,
      ],
    }).compile();

    _service = _module.get<UserService>(UserService);
    _repo = _module.get<Repository<User>>(getRepositoryToken(User));
    _service = _module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(_service).toBeDefined();
  });

  describe('signup', () => {
    it('should throw an error if user already exists', async () => {
      _repo.findOneBy = jest.fn().mockResolvedValue(mockUser);

      await expect(
        _service.signup({
          email: mockUser.email,
          password_hash: 'RandomPassword!!',
          full_name: mockUser.full_name,
        }),
      ).rejects.toThrow(HttpException);

      await expect(
        _service.signup({
          email: mockUser.email,
          password_hash: 'RandomPassword!!',
          full_name: mockUser.full_name,
        }),
      ).rejects.toThrowError(USER_KEYS.ALREADY_EXISTS);
    });

    it('should throw an error if password hash fails', async () => {
      _repo.findOneBy = jest.fn().mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockRejectedValue(new Error(USER_KEYS.SOMETHING_WRONG) as never);

      await expect(_service.signup(mockUser)).rejects.toThrowError(
        USER_KEYS.SOMETHING_WRONG,
      );
    });

    it('should create a new user and remove password_hash', async () => {
      _repo.findOneBy = jest.fn().mockResolvedValue(null);

      jest.spyOn(bcrypt, 'genSalt').mockResolvedValueOnce('salt' as never);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('hashedpassword' as never);

      _repo.save = jest.fn().mockResolvedValue({ ...mockUser, id: 1 });

      const result = await _service.signup({
        email: mockUser.email,
        password_hash: '1234',
        full_name: mockUser.full_name,
      });

      expect(result).toEqual({
        email: 'test@example.com',
        full_name: 'Test User',
        id: expect.any(Number),
      });
      expect(_repo.save).toHaveBeenCalledTimes(1);
      expect(_repo.save).toHaveBeenCalledWith({
        email: mockUser.email,
        password_hash: 'hashedpassword',
        full_name: mockUser.full_name,
      });
    });
  });
});
