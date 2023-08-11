import { Exclude } from "class-transformer";
import { Qrhistoric } from "src/api/qrhistoric/entities/qrhistoric.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100, nullable: false })
    name: string;
    @Column({ type: "varchar", length: 100, nullable: false, unique: true })
    email: string;
    @Column({ type: "varchar", length: 100, nullable: false })
    @Exclude()
    password: string;
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(()=> Qrhistoric, qrhistoric => qrhistoric.id)
    qrhistoric: Qrhistoric[];
}