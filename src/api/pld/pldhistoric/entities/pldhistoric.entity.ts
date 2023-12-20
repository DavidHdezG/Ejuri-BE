import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Pldhistoric {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable:true})
    public companyName: string;
    
    @CreateDateColumn({ type: 'timestamp' })
    public createdAt!: Date;
    
    @ManyToOne(()=> User, (user) => user.pldHistoric)
    user: string;

    @Column()
    public driveId: string;
    
}
