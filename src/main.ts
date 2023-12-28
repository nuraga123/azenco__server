import * as session from 'express-session';
import * as passport from 'passport';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Используйте express-session
  app.use(
    session({
      secret: 'keyword',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Инициализация passport и использование SessionSerializer
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

  // Слушаем на порту 3000
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
