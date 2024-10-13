import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class SignupUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}

export const KEYS = {
  NOTFOUND: 'User not found',
  ALREADYEXISTS: 'User already exists',
  UNAUTHORIZED: 'Unauthorized',
};
