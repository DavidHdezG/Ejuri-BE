import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateQrhistoricDto {
    /* @IsNumber() */
    @ApiProperty()
    @IsNotEmpty()
    client:string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    folio:string;
    @ApiProperty()
    @IsString()
    comments:string; 
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    document:string; 
    @ApiProperty()
    /* @IsString() */
    @IsNotEmpty()
    @ApiProperty()
    category:string;
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    qr:string;
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    user:string;
}
