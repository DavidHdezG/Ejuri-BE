import { Req } from "@nestjs/common";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    name:string;
}
