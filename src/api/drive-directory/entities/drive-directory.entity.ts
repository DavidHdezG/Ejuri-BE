import { Category } from "src/api/category/entities/category.entity";
import { Client } from "src/api/client/entities/client.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class DriveDirectory {
    @PrimaryColumn()
    public id: string;
    @Column()
    public name: string;
    @ManyToOne(() => DriveDirectory, (directory) => directory.parent, { nullable: true })
    public parent: string;
    @ManyToOne(()=> Category, category => category.driveDirectory)
    public category: Category;

}
