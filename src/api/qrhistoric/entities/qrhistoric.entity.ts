import { Client } from "src/api/client/entities/client.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "src/api/documents/entities/document.entity";
import { Category } from "src/api/category/entities/category.entity";
import { User } from "src/users/entities/user.entity";
@Entity()
export class Qrhistoric {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Client, client => client.qrhistoric)
    client: string;

    @Column()
    folio: string;

    @Column()
    comments: string;

    @ManyToOne(() => Document, document => document.qrhistoric)
    document: string;

    @ManyToOne(()=> Category, category => category.qrhistoric)
    category: string;

    @Column()
    qr: string;

    @ManyToOne(()=> User, user => user.qrhistoric)
    user: string;

    @CreateDateColumn({ type: 'timestamp' })
    public createdAt!: Date;

}
