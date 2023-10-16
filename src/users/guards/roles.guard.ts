import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../interfaces/role.interface';
import { User } from '../entities/user.entity';
import { Observable } from 'rxjs';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users.service';

/**
 * Guard to check if the user has the role needed to access to the endpoint
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private rolesService:RolesService, private userService:UsersService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requireRoles = this.reflector.getAllAndOverride<number>('roleId', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    
    const userId = request.currentUser.id;
    const user = await this.userService.findOneById(userId);
    /* const userRoles = user.roles; */
    if(user.roles.id===10){
        return true;
    }
/*     return requireRoles.some((role)=>{
            return user.role?.includes(role);
        })
 */
  return user.roles.id===requireRoles;
  }
}
