import { Column, Entity, JoinColumn, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cell } from "../../cell/entities/cell.entity";
import { AnnexCell } from "../../annex-cell/entities/annex-cell.entity";

@Entity()
export class Annex {
    @PrimaryGeneratedColumn()
    public id:number;

    @Column()
    public name:string;

    @Column({default: true})
    public available:boolean;

    @OneToMany(()=> AnnexCell, annexCell => annexCell.annex)
    @JoinColumn()
    public annexCell: AnnexCell;

    
}
