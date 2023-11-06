import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Annex } from "../../annex/entities/annex.entity";
import { AnnexCell } from "../../annex-cell/entities/annex-cell.entity";

@Entity()
export class Cell {
    @PrimaryGeneratedColumn()
    public id:number;

    @Column()
    public name:string;

    @Column()
    public cell:string;

    @OneToMany(()=> AnnexCell, annexCell => annexCell.id)
    public annexCell: number[];
}
