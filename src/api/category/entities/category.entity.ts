import { Qrhistoric } from "src/api/qrhistoric/entities/qrhistoric.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "src/api/documents/entities/document.entity";
import { Client } from "src/api/client/entities/client.entity";
@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    public id:string

    @Column()
    public name:string
    
    @Column({nullable:true})
    public driveId:string

    @OneToMany(()=> Qrhistoric, qrhistoric => qrhistoric.id)
    public qrhistoric: Qrhistoric[];

    @OneToMany(()=> Document, document => document.id)
    public document: Document[];

    @OneToMany(()=> Client, client => client.id)
    public client: Client[];

    @Column({ type: 'boolean', default: false})
    public isDeleted: boolean;
}
