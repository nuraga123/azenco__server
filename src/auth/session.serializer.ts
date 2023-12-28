import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  // Сериализация пользователя - сохранение только идентификатора
  serializeUser(user: any, done: (err: Error, userId: string) => void) {
    done(null, user.id); // предположим, что у вас есть поле id у пользователя
  }

  // Десериализация пользователя - поиск пользователя по идентификатору
  deserializeUser(payload: any, done: (err: Error, user: any) => void) {
    console.log(payload);
    done(null, payload);
  }
}
