import { Exclude } from 'class-transformer';
import { Qrhistoric } from 'src/api/qrhistoric/entities/qrhistoric.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
/* import { Role } from '../interfaces/role.interface'; */
import { Status } from '../interfaces/status.interface';
import { Role } from '../roles/entities/role.entity';
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
/*   @Column({ type: 'enum', enum: Role, default: Role.JURIDICO })
  role: Role; */

  @OneToMany(() => Qrhistoric, (qrhistoric) => qrhistoric.id)
  qrhistoric: Qrhistoric[];

  @Column({type: 'enum',enum: Status,default:Status.NO_CONFIRMADO})
  status:Status
  
  @ManyToOne(() => Role, (role) => role.id)
  roles: Role;
}
