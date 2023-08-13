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
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
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
@Controller('users')
@UseInterceptors(CurrentUserInterceptor)

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

/*   @UseInterceptors(ClassSerializerInterceptor)
  @Get('user')
  async user(@Session() session: any) {
    if (!session.userId) {
      throw new UnauthorizedException();
    }
    console.log(session.userId);
    const user = await this.usersService.findOneById(session.userId);
    return user;
  } */
  @UseGuards(AuthGuard)
  @Get('user')
  user(@CurrentUser() user:User){
    return user;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOneById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(parseInt(id));
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
  /*   @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password.toString(),
      12,
    );
    createUserDto.password = hashedPassword;
    const user = await this.usersService.create(createUserDto);
    return user;
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      return { message: 'User not found' };
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { message: 'Wrong password' };
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });
    response.cookie('jwt', jwt, { httpOnly: false });
    return { message: 'Success' };
  }
  @Get('user')
  async user(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      if (!data) {
        throw new UnauthorizedException();
      }
      const user = await this.usersService.findOneById(data['id']);
      const { password, ...result } = user;
      return result;
    } catch (e) {
      console.log(e.message);
      throw new UnauthorizedException();
    }
  }
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { message: 'Success' };
  } */
}
