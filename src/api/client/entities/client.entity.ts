import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Qrhistoric } from '../../qrhistoric/entities/qrhistoric.entity';
import { Category } from 'src/api/category/entities/category.entity';

@Entity()
export class Client {
  @PrimaryColumn()
  public id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  public name: string;

  @Column({ type: 'boolean', default: false })
  public isDeleted: boolean;

  @OneToMany(() => Qrhistoric, (qrhistoric) => qrhistoric.id)
  public qrhistoric: Qrhistoric[];

  @ManyToOne(() => Category, (category) => category.id)
  public category: Category;
}
