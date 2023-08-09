import { Qrhistoric } from "src/api/qrhistoric/entities/qrhistoric.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "src/api/documents/entities/document.entity";
@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    public id:string

    @Column()
    public name:string
    
    @OneToMany(()=> Qrhistoric, qrhistoric => qrhistoric.id)
    public qrhistoric: Qrhistoric[];

    @OneToMany(()=> Document, document => document.id)
    public document: Document[];
}
