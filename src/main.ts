import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common'; 
import cookieSession from 'cookie-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('PORT');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  /*   app.use(cookieParser()); */
  app.use(
    cookieSession({
      keys: [process.env.COOKIE_KEY + ''],
      secure: false,
      httpOnly: false,
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  const configSwagger = new DocumentBuilder().addCookieAuth('session-id')
    .setTitle('Ejuri RestAPI')
    .setDescription('RestApi made for Ejuri')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs', app, document);
  await app.listen(port, () => {
    Logger.log(
      `Server is running on url http://localhost:${port} + frontend: ${process.env.FRONTEND_URL}`, 'Main'
    );
  });
}
bootstrap();
