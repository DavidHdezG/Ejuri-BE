import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {
    @IsNotEmpty()
    @ApiProperty()
    id:number;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name:string;
}
