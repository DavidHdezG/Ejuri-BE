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

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';

import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from './interfaces/role.interface';
import { RolesGuard } from './guards/roles.guard';
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
  @Roles(Role.ADMIN)
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
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

  @UseGuards(AuthGuard)
  @Get('user')
  user(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(Role.JURIDICO, Role.ADMIN)
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

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('change-password')
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
}
