import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateQrhistoricDto {
    @IsNumber()
    @IsNotEmpty()
    client:string;
    @IsString()
    @IsNotEmpty()
    folio:string;
    @IsString()
    comments:string; 
    @IsString()
    @IsNotEmpty()
    document:string; 
    @IsString()
    @IsNotEmpty()
    category:string;
    @IsString()
    @IsNotEmpty()
    qr:string;
    @IsString()
    @IsNotEmpty()
    user:string;
}
