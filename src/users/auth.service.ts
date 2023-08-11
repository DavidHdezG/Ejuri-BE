import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from './dto/create-user.dto';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(createUserDto: CreateUserDto) {
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

  async signin(email:string,password:string){
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
}
