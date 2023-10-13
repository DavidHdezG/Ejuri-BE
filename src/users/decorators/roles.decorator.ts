import { SetMetadata } from "@nestjs/common";
import { Role } from "../interfaces/role.interface";

/**
 * Decorator to set the role needed to access to the endpoint
 * @param roleId 
 * @returns 
 */
export const Roles = (roleId: number) => SetMetadata('roleId', roleId);