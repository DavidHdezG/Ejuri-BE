import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Historic {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    name:string;
    @Column({nullable:true})
    public clientNumber: string;
    
    @CreateDateColumn({ type: 'timestamp' })
    public createdAt!: Date;
    
    @ManyToOne(()=> User, (user) => user.pldHistoric)
    user: string;

    @Column()
    public driveId: string;
    
}
