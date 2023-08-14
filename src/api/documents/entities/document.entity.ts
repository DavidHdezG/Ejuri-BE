import { Category } from "src/api/category/entities/category.entity";
import { Qrhistoric } from "src/api/qrhistoric/entities/qrhistoric.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Document {
    @PrimaryColumn()
    public id:string

    @Column()
    public type:string

    @Column()
    public duplicate:string

    @OneToMany(()=> Qrhistoric, qrhistoric => qrhistoric.id)
    public qrhistoric: Qrhistoric[];  
    
    @ManyToOne(()=> Category, category => category.document)
    public category: string;

    @Column({ type: 'boolean', default: false})
    public isDeleted: boolean;
}
