import { SetMetadata } from "@nestjs/common";
import { Role } from "../interfaces/role.interface";

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);