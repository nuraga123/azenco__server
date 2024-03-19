import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private configService: ConfigService,
  ) {}

  async findOne(filter: {
    where: { id?: number; username?: string; email?: string };
  }): Promise<User> {
    return await this.userModel.findOne({ ...filter });
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<User | { warningMessage: string }> {
    const user = new User();

    const existingByUserName = await this.findOne({
      where: { username: createUserDto.username },
    });

    const existingByEmail = await this.findOne({
      where: { email: createUserDto.email },
    });

    if (existingByUserName) {
      return { warningMessage: 'Пользователь с таким именем уже существует' };
    }

    if (existingByEmail) {
      return { warningMessage: 'Пользователь с таким email уже существует' };
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    user.username = createUserDto.username;
    user.password = hashedPassword;
    user.email = createUserDto.email;

    return user.save();
  }

  async findUserOne(userId: number) {
    const usersData = await this.userModel.findAll();
    const result = usersData.filter((item) => item.id === userId);
    return result[0];
  }

  async updateUserPassword(
    userSecret: string,
    userId: number,
    newPassword: string,
  ): Promise<{ User: User; message: string } | { message: string }> {
    // Находим пользователя по его userId
    const user = await this.findUserOne(userId);
    const consoleLogger = new Logger('UsersService');
    consoleLogger.log(user);
    if (!user) {
      return { message: 'Пользователья не существует' };
    }

    if (!newPassword) {
      return { message: 'new password не существует' };
    }

    const secretWord = this.configService.get<string>('SECRET');
    if (secretWord === userSecret) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Обновляем пароль пользователя в базе данных
      user.password = hashedPassword;
      await user.save();

      // Возвращаем обновленного пользователя
      return { ...user, message: 'пароль обнавлен' };
    } else {
      return { message: 'неправильное секретное слово' };
    }
  }
}
