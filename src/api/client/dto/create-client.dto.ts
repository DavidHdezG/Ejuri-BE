import { Req } from "@nestjs/common";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateClientDto {
    @IsNotEmpty()
    @IsString()
    id:string;
    @IsString()
    @IsNotEmpty()
    name:string;
}
