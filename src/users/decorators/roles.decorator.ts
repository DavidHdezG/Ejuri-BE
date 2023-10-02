import { SetMetadata } from "@nestjs/common";
import { Role } from "../interfaces/role.interface";

export const Roles = (roleId: number) => SetMetadata('roleId', roleId);