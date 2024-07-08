import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';
import * as express from 'express';
import { AppModule } from './app.module';
// import { Logger } from '@nestjs/common';

async function bootstrap() {
  //const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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
      'http://localhost:3001',
      'https://azenco-client.onrender.com',
      'https://azenco-client.vercel.app',
      'http://192.168.1.2:3001',
      'http://192.168.1.3:3001',
      'http://192.168.0.182:3001',
      'http://192.168.1.41:3001',
      'http://192.168.1.42:3001',
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

  /*
  // Пример вывода в консоль каждые 30 секунд
  setInterval(() => {
    logger.log('Сервер работает 15 секунд!');
  }, 15000);

  // Пример вывода в консоль каждую минуту
  setInterval(() => {
    logger.log('Сервер работает два метода по 30 секунд!');
  }, 30000);
  */

  // Обслуживание статических файлов из папки public
  app.use(express.static('public'));

  // Прослушивание порта 3000 или из переменной окружения, если указана
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
