import {
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class RoleCreateDto {
  @IsString()
  name: string;

  @IsDate()
  @IsOptional()
  created_at?: Date;

  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @IsDate()
  @IsOptional()
  deleted_at?: Date;
}

export class RoleAssignDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  role_id: string;
}

export class UserFilterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  sort: 'ASC' | 'DESC' = 'DESC';

  @IsString()
  column: 'name' | 'email' | 'id' | 'created_at' | 'updated_at' = 'name';

  @IsNumber()
  from?: number = 1;

  @IsNumber()
  to?: number = 10;

  @IsString()
  order: string;
}
