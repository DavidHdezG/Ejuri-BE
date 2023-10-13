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
import { ApiBody, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
@ApiCookieAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

/*   

   
  @ApiResponse({ status: 200, description: 'Usuario creado y sesión iniciada' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBody({ type: CreateUserDto })
  @Post('signup')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Session() session: any,
  ): Promise<User> {
    const user = await this.authService.signup(createUserDto);
    session.userId = user.id;
    return user;
  } */

  /**
   * Register a new user, encrypt the password and send a confirmation email (only admin)
   * @param createUserDto 
   * @returns 
   */
  @ApiResponse({ status: 200, description: 'Usuario creado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register-user')
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateUserDto })
  @Roles(10)
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    const user = await this.authService.signup(createUserDto);
    return user;
  }

  /**
   * Sign in a user
   * @param user 
   * @param password 
   * @returns 
   */
  @ApiResponse({ status: 200, description: 'Sesión iniciada' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'correo@blucapital.mx',
        },
        password: {
          type: 'string',
          example: 'password',
        },
      },
    },
  })
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

  /**
   * Sign out a user
   * @param session 
   */
  @ApiResponse({ status: 200, description: 'Sesión cerrada' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @Post('signout')
  @UseGuards(AuthGuard)
  signOut(@Session() session: any) {
    session.userId = null;
  }

  /**
   * Confirm the account of a user with the token sent by email
   * @param token
   * @returns 
   */
  @ApiResponse({ status: 200, description: 'Cuenta confirmada' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 400, description: 'Error al autentificar' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('confirmAccount/:token')
  async confirmAccount(@Param('token') token: string) {
    const user = await this.authService.confirmAcount(token);
    if (!user) {
      return new BadRequestException('Error al autentificar');
    }
    return user;
  }

  /**
   * Get the current user
   * @param user 
   * @returns 
   */
  @ApiResponse({ status: 200, description: 'Usuario actual' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @UseGuards(AuthGuard)
  @Get('user')
  user(@CurrentUser() user: User) {
    return user;
  }

  /**
   * 
   * @returns All users
   */
  @ApiResponse({ status: 200, description: 'Usuarios encontrados' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(10)
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  /**
   * 
   * @returns All users deleted
   */
  @ApiResponse({ status: 200, description: 'Usuarios eliminados encontrados' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(10)
  @Get('deleted')
  async findDeleted(): Promise<User[]> {
    return await this.usersService.findDeleted();
  }

  /** 
   * Return a user by id
   * @param id
   * @returns User
   */
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
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

  /**
   * Change the password of a user
   * @param user 
   * @param password 
   * @param newPassword 
   * @returns 
   */
  @ApiResponse({ status: 200, description: 'Contraseña cambiada' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
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
    return await this.authService.changePassword(
      user.email,
      password,
      newPassword,
    );
  }

  /**
   * Delete a user
   * @param id
   * @returns User
   */
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
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

  /**
   * Update a user
   * @param id 
   * @param updateUserDto 
   * @returns 
   */
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('edit/:id')
  @Roles(10)
  @ApiBody({ type: UpdateUserDto })
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
