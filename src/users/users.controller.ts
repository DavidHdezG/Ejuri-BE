import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
  Session,
  UseGuards,

} from '@nestjs/common';

import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { Response, Request } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from './interfaces/role.interface';
import { RolesGuard } from './guards/roles.guard';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async createUser(@Body() createUserDto: CreateUserDto, @Session() session: any): Promise<User> {
    const user= await this.authService.signup(createUserDto);
    session.userId = user.id;
    return user;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signin')
  async signIn(@Body('email') email: string, @Body('password') password: string , @Session() session: any) {
    const user = await this.authService.signin(email, password);
    session.userId = user.id;
    return user;
  }

  @Post('signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }

  @UseGuards(AuthGuard)
  @Get('user')
  user(@CurrentUser() user:User){
    return user;
  }

  @UseGuards(AuthGuard,RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(Role.ADMIN)
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @Roles(Role.ADMIN)
  async findOneById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(parseInt(id));
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
