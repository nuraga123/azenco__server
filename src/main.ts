import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as session from 'express-session';
import * as passport from 'passport';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: 'keyword',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3001'],
  });

  const config = new DocumentBuilder()
    .setTitle('Azenco Anbar Serveri')
    .setDescription('api documentation')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const documemnt = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documemnt);

  await app.listen(3000);
}
bootstrap();
