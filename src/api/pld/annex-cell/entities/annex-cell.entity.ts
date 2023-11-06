import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Annex } from "../../annex/entities/annex.entity";
import { Cell } from "../../cell/entities/cell.entity";
@Entity()
export class AnnexCell {
    @PrimaryGeneratedColumn()
    public id:number;

    @ManyToOne(()=> Annex, annex => annex.annexCell)
    @JoinColumn()
    public annex: number;

    @ManyToOne(()=> Cell, cell => cell.annexCell)
    @JoinColumn()
    public cell: number;

    @Column( { type: 'boolean', default: false})
    public required: boolean;
}
