import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as passport from 'passport';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  // Метод для аутентификации пользователя
  async authenticateUser(request: any): Promise<void> {
    // Проверяем, аутентифицирован ли пользователь
    if (!request.user) {
      // Используем Promise для асинхронного ожидания аутентификации через Passport
      await new Promise<void>((resolve, reject) => {
        passport.authenticate('local', (err: any, user: any, info: any) => {
          // Логируем ошибку аутентификации (если есть)
          if (err) {
            console.log('Ошибка аутентификации:', err);
            console.log('Дополнительная информация:', info);
            console.log(reject(err));
          }

          // Если пользователь не найден, отклоняем запрос
          if (!user) {
            console.log(new Error('Authentication failed'));
          }

          // Вход пользователя в систему
          request.login(user, (err: any) => {
            if (err) {
              console.log('Ошибка при входе пользователя:', err);
            } else {
              console.log('Пользователь успешно вошел в систему');
            }
            resolve();
          });
        })(request, null, resolve);
      });

      // После повторной проверки, request.user должен быть определен
      if (request.user) {
        console.log({
          user: request.user,
        });
      } else {
        console.log('request.user не определен после повторной проверки');
      }
    }
  }

  // Метод, вызываемый NestJS для определения доступа к ресурсу
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Получаем объект запроса из контекста выполнения
    const request = context.switchToHttp().getRequest();

    // Аутентифицируем пользователя
    await this.authenticateUser(request);

    // Возвращаем флаг аутентификации
    console.log(`флаг аутентификации: => ${request.isAuthenticated()} `);
    return request.isAuthenticated();
  }
}
