import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {
    @IsNotEmpty()

    id:number
    @IsNotEmpty()
    @IsString()
    name:string
}
