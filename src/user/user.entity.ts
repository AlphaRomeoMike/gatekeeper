import { Role } from 'src/role/role.entity';
import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: '50', unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: '30' })
  full_name: string;

  @Column({ type: 'varchar', select: false })
  password_hash: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({
    name: 'role_id',
  })
  role: Role;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
