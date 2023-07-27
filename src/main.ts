import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>("PORT");

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true}));
  app.use(cookieParser());
  app.enableCors(
    {
      origin: 'http://localhost:3001',
      credentials: true,
    }
  );
  await app.listen(port,() => {
    console.log(`Server is running on url `,`http://localhost:${port}`);
  });
}
bootstrap();
