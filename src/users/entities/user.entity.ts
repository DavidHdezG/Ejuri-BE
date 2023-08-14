import { Exclude } from 'class-transformer';
import { Qrhistoric } from 'src/api/qrhistoric/entities/qrhistoric.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../interfaces/role.interface';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  email: string;
  @Column({ type: 'varchar', length: 100, nullable: false })
  @Exclude()
  password: string;
  @Column({ type: 'boolean', default: false })
  @Exclude()
  isDeleted: boolean;
  @CreateDateColumn({ type: 'timestamp' })
  @Exclude()
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  @Exclude()
  updatedAt: Date;
  @Column({ type: 'enum', enum: Role, default: Role.JURIDICO })
  role: Role;
  @OneToMany(() => Qrhistoric, (qrhistoric) => qrhistoric.id)
  qrhistoric: Qrhistoric[];
}
