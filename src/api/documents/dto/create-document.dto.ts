import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateDocumentDto {
    @ApiProperty()
    @IsNotEmpty()
    id:string;
    @ApiProperty()
    @IsNotEmpty()
    category:any;
    @IsNotEmpty()
    @ApiProperty()
    type:string;
    @IsNotEmpty()
    @ApiProperty()
    duplicate:string;
}
