import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'
import { Status } from './interfaces/status.interface';
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
    return await this.sendConfirmationEmail(user);
  }

  async signin(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if(user.status==Status.NO_CONFIRMADO){
      throw new BadRequestException('Invalid credentials')
    }
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid credentials');
    }
    return user;
  }

  async changePassword(
    email: string,
    password: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.signin(email, password);
    if (!user) {
      throw new NotFoundException('Contraseña incorrecta');
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(newPassword, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');
    Object.assign(user, { password: result });
    const resultUpdate = await this.usersService.update(user.id, user);

    return resultUpdate;
  }

  async sendConfirmationEmail(user: User) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const token = jwt.sign({email:user.email},process.env.JWT_SECRET)
    const urlConfirm = `${process.env.FRONTEND_URL}/confirmAccount/${token}`;
    const mailDetails = {
      from: "Ejuri <dhernandez@blucapital.mx>", // sender address
      to: user.email, // receiver email
      subject: "Confirma tu email", // Subject line
      html: `<p> ${user.name}: <br/> Confirma tu email en <a href="${urlConfirm}">Confirmar</a></p>`,
  }
    try {
      const info = await transporter.sendMail(mailDetails)
      console.log(info)
      return user;
    } catch (error) {
      console.log(error);
    } 
  }

  async confirmAcount(token:string){
    console.log(process.env.JWT_SECRET)
    let email=null;
    try{
      const payload:any = jwt.verify(token,process.env.JWT_SECRET)
      email=payload.email;

      const user = await this.usersService.findOne(email);
      if(!user){
        throw new NotFoundException('User not found')
      } 
      if(user.status== Status.CONFIRMADO){
        throw new BadRequestException('User already confirmed');
      }

      Object.assign(user,{status: Status.CONFIRMADO})
      return await this.usersService.update(user.id,user);
    }catch(e){
      console.log(e)
    }


  }
}
