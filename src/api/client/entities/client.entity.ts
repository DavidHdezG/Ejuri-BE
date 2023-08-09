import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Qrhistoric } from "../../qrhistoric/entities/qrhistoric.entity";

@Entity()
export class Client{
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: "varchar", length: 100, nullable: false })
    public name: string;

    @Column({ type: 'boolean', default: false })
    public isDeleted: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    public createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    public updatedAt!: Date;

    @OneToMany(()=> Qrhistoric, qrhistoric => qrhistoric.id)
    public qrhistoric : Qrhistoric[];
}
