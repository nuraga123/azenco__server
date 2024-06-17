import * as session from 'express-session';
import * as passport from 'passport';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Используем express-session для управления сессиями
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'keyword', // Секрет для подписи куки сессии
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
      'http://localhost:3001', // Разрешенные источники запросов
      'https://azenco-client.onrender.com',
      'https://azenco-client.vercel.app',
      'http://192.168.1.2:3001', // Обратите внимание, что адреса должны быть полными
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

  // Пример вывода в консоль каждые 30 секунд
  setInterval(() => {
    logger.log('Сервер работает 15 секунд!');
  }, 15000);

  // Пример вывода в консоль каждую минуту
  setInterval(() => {
    logger.log('Сервер работает два метода по 30 секунд!');
  }, 30000);

  // Обслуживание статических файлов из папки public
  app.use(express.static('public'));

  // Прослушивание порта 3000 или из переменной окружения, если указана
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
