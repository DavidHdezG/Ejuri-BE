import { User } from "src/users/entities/user.entity";
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {
    @PrimaryColumn()
    public id: number;

    @Column()
    public name: string;

    @OneToMany(() => User, user => user.roles)
    public user: User[];

}
