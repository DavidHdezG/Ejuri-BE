import {
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';

/**
 * Decorator to get the current user in the request
 */
export const CurrentUser= createParamDecorator(
    (data:never, context: ExecutionContext)=>{
        const request = context.switchToHttp().getRequest();
        return request.currentUser;
    }
)