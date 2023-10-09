import { Req } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateClientDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    id:string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name:string;
}
