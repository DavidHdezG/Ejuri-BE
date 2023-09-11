import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(createUserDto: CreateUserDto): Promise<User> {
    const users = await this.usersService.findOne(createUserDto.email);
    if (users) {
      throw new BadRequestException('email in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(createUserDto.password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');
    Object.assign(createUserDto, { password: result });
    const user = await this.usersService.create(createUserDto);
    return user;
  }

  async signin(email:string,password:string): Promise<User>{
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid credentials');
    }
    return user;
  }

  async changePassword( email:string, password:string, newPassword:string): Promise<User>{
    const user = await this.signin(email,password);
    if (!user) {
      throw new NotFoundException('Contraseña incorrecta');
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(newPassword, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');
    Object.assign(user, { password: result });
    const resultUpdate = await this.usersService.update(user.id,user);

    return resultUpdate;
  }
  
}
