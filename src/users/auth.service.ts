import {
  BadRequestException,
  Injectable,
  Logger,
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

/**
 * Service to manage the authentication
 */
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  /**
   * Register a new user, encrypt the password and send a confirmation email
   * @param createUserDto 
   * @returns 
   */
  async signup(createUserDto: CreateUserDto): Promise<User> {
    const users = await this.usersService.findOne(createUserDto.email);
    if (users) {
      throw new BadRequestException('email in use');
    }
    const password = createUserDto.password;
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(createUserDto.password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');
    Object.assign(createUserDto, { password: result });
    const user = await this.usersService.create(createUserDto);
    return await this.sendConfirmationEmail(user,password);
  }

  /**
   * Sign in a user
   * @param email 
   * @param password 
   * @returns 
   */
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

  /**
   * Change the password of a user
   * @param email 
   * @param password 
   * @param newPassword 
   * @returns 
   */
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

  /**
   * Send a confirmation email to a user
   * @param user 
   * @param password 
   * @returns 
   */
  async sendConfirmationEmail(user: User,password:string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'dhernandez@blucapital.mx',
        pass: 'klloxegascwifmmx',
      },
    });

    const token = jwt.sign({email:user.email},process.env.JWT_SECRET)
    const urlConfirm = `${process.env.FRONTEND_URL}/confirmAccount/${token}`;
    const mailDetails = {
      from: "Ejuri <dhernandez@blucapital.mx>", // sender address
      to: user.email, // receiver email
      subject: `${user.name}, confirma tu email`, // Subject line
      html: `<h3>Credenciales:</h3>
      <p>Correo: ${user.email}<p/> 
      <p>Contraseña: ${password}<p/> <br/>
      Confirma tu email en <a href="${urlConfirm}">Confirmar</a></p>`,
  }
    try {
      const info = await transporter.sendMail(mailDetails)
      return user;
    } catch (error) {
      Logger.error(error,'AuthService - sendConfirmationEmail')
    } 
  }

  /**
   * Confirm the account of a user with a token 
   * @param token 
   * @returns 
   */
  async confirmAcount(token:string){
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
      Logger.error(e,'AuthService - confirmAccount')
    }


  }
}
