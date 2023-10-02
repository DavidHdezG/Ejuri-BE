import { Module, MiddlewareConsumer } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { RolesModule } from './roles/roles.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]),
            JwtModule.register({
              secret: 'secret',
              signOptions: { expiresIn: '1d' },
            }),
            RolesModule],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService, AuthService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
