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
  BadRequestException,
  Delete,
  Patch,
} from '@nestjs/common';

import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';

import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from './interfaces/role.interface';
import { RolesGuard } from './guards/roles.guard';
import { Status } from './interfaces/status.interface';
import { UpdateUserDto } from './dto/update-user.dto';
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Session() session: any,
  ): Promise<User> {
    const user = await this.authService.signup(createUserDto);
    session.userId = user.id;
    return user;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register-user')
  @UseGuards(AuthGuard)
  @Roles(10)
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    console.log(createUserDto)
    const user = await this.authService.signup(createUserDto);
    return user;
  }


  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signin')
  async signIn(
    @Body('email') email: string,
    @Body('password') password: string,
    @Session() session: any,
  ) {
    const user = await this.authService.signin(email, password);
    session.userId = user.id;
    return user;
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  signOut(@Session() session: any) {
    session.userId = null;
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('confirmAccount/:token')
  async confirmAccount(@Param('token') token:string){
    const user = await this.authService.confirmAcount(token);
    if(!user){
      return  new BadRequestException("Error al autentificar")
    }
    return user;
  }

  @UseGuards(AuthGuard)
  @Get('user')
  user(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(10)
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(10)
  @Get('deleted')
  async findDeleted(): Promise<User[]> {
    return await this.usersService.findDeleted();
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @Roles(10)
  async findOneById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(parseInt(id));
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('changePassword')
  async changePassword(
    @CurrentUser() user: User,
    @Body('password') password: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return await this.authService.changePassword(user.email, password, newPassword);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  @Roles(10)
  async delete(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.delete(parseInt(id));
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('edit/:id')
  @Roles(10)
  async edit(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    console.log(updateUserDto);
    const user = await this.usersService.update(parseInt(id), updateUserDto);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
