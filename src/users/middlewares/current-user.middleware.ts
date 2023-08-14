import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { UsersService } from "../users.service";

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware{
    constructor(
        private usersService: UsersService
    ){}
    async use(req: Request, res: Response, next: (error?: NextFunction) => void) {
        const {userId} = req.session || {};

        if(userId){
            const user = await this.usersService.findOneById(userId);
            // @ts-ignore
            req.currentUser = user;
        }

        next();
    }
}