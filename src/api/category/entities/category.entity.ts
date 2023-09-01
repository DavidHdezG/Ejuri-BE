import { Qrhistoric } from "src/api/qrhistoric/entities/qrhistoric.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "src/api/documents/entities/document.entity";
import { DriveDirectory } from "src/api/drive-directory/entities/drive-directory.entity";
import { Client } from "src/api/client/entities/client.entity";
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

    @OneToMany(()=> DriveDirectory, driveDirectory => driveDirectory.id)
    public driveDirectory: DriveDirectory[];

    @OneToMany(()=> Client, client => client.id)
    public client: Client[];

    @Column({ type: 'boolean', default: false})
    public isDeleted: boolean;
}
