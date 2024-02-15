import * as session from 'express-session';
import * as passport from 'passport';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Используйте express-session
  app.use(
    session({
      secret: 'keyword',
      resave: false,
      saveUninitialized: false,
    }),
  );

  passport.serializeUser(function (user: any, done) {
    console.log(user);
    done(null, user);
  });

  passport.deserializeUser(function (user: any, done) {
    console.log(user);
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // Разрешение CORS
  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:3001',
      'https://azenco-client.onrender.com',
      'https://azenco-client.vercel.app',
    ],
  });

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Azenco Swagger')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Пример вывода каждые 30 секунд
  setInterval(() => {
    logger.log('Server Working !');
  }, 35000);

  // Пример вывода каждую минуту
  setInterval(() => {
    logger.log('Server Working Two method !');
  }, 60000);

  // Обслуживание статических файлов из папки public
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Слушаем на порту 3000
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
