import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class UserCreateDto {
  constructor() {}

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password_hash: string;

  @IsString()
  full_name: string;
}

export class AuthCreateDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password_hash: string;
}
