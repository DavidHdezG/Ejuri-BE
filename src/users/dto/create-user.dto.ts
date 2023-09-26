import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Role } from "../interfaces/role.interface";

export class CreateUserDto{
    @IsString()
    @IsNotEmpty()
    name:string;
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsNotEmpty()
    password:string;
    
    @IsNotEmpty()
    role:Role;
}