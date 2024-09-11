import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';
import * as express from 'express';
import { AppModule } from './app.module';

import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Определите абсолютные пути к SSL-сертификатам
  const keyPath = path.resolve(__dirname, '..', 'src/cert', 'cert.key');
  const certPath = path.resolve(__dirname, '..', 'src/cert', 'cert.crt');

  // Чтение SSL-сертификатов
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  logger.log('httpsOptions');

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // Используем express-session для управления сессиями
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'keyword',
      resave: false, // Не сохранять сессию, если нет изменений
      saveUninitialized: false, // Не сохранять новую, но не измененную сессию
    }),
  );

  // Настройка Passport
  passport.serializeUser(function (user: any, done) {
    console.log(user);
    done(null, user);
  });

  passport.deserializeUser(function (user: any, done) {
    console.log(user);
    done(null, user);
  });

  app.use(passport.initialize()); // Инициализация Passport
  app.use(passport.session()); // Подключение сессий к Passport

  // Разрешение CORS
  app.enableCors({
    credentials: true, // Позволяет передавать куки через CORS
    origin: [
      'http://localhost:3001',
      'https://azenco-client.onrender.com',
      'https://azenco-client.vercel.app',
      'http://192.168.1.2:3001',
      'http://192.168.1.3:3001',
      'http://192.168.0.182:3001',
      'http://192.168.1.41:3001',
      'http://192.168.1.42:3001',
      'http://192.168.1.43:3001',
      'http://192.168.1.44:3001',
      'http://192.168.1.45:3001',
      'http://192.168.1.46:3001',
      'http://192.168.1.47:3001',
      'http://192.168.1.48:3001',
      'http://192.168.1.49:3001',
      'http://192.168.1.50:3001',
      'http://192.168.100.5:3001',
    ],
  });

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Azenco Swagger') // Заголовок документации
    .setDescription('Документация API') // Описание
    .setVersion('1.0') // Версия
    .addTag('api') // Тег для группировки
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Монтирование Swagger на /swagger
  SwaggerModule.setup('swagger', app, document);

  // Обслуживание статических файлов из папки public
  app.use(express.static('public'));

  // Прослушивание порта 3000 или из переменной окружения, если указана
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
