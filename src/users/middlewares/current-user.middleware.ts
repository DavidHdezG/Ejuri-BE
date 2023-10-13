import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { UsersService } from "../users.service";
import { User } from "../entities/user.entity";

declare global {
    namespace Express {
        interface Request {
            currentUser?: User;
        }
    }
}

/**
 * Middleware to get the current user info in the cookie session
 */
@Injectable()
export class CurrentUserMiddleware implements NestMiddleware{
    constructor(
        private usersService: UsersService
    ){}
    async use(req: Request, res: Response, next: (error?: NextFunction) => void) {
        const {userId} = req.session || {};

        if(userId){
            const user = await this.usersService.findOneById(userId);
            
            req.currentUser = user;
        }

        next();
    }
}