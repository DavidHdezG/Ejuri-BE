import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateHistoricDto {

    @ApiProperty()
    @IsString()
    companyName: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    driveId: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    user: string;
}
