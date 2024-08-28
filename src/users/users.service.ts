import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { IUserResponce } from './types';

@Injectable()
export class UsersService {
  private readonly consoleLogger = new Logger(UsersService.name);
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

  async findOneById(id: number): Promise<IUserResponce> {
    const user = await this.userModel.findOne({ where: { id } });
    if (!user) return { error_message: `Anbar istifadəçisi tapılmadı: ${id}` };
    return { user };
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
      return { warningMessage: 'Eyni adlı istifadəçi artıq mövcuddur' };
    }

    if (existingByEmail) {
      return { warningMessage: 'Bu e-poçtu olan istifadəçi artıq mövcuddur' };
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
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ User: User; message: string } | { message: string }> {
    const { id, secret, newPassword } = updatePasswordDto;

    if (!secret) {
      return { message: 'gizli söz yazılmayıb' };
    }

    if (!newPassword) {
      return { message: 'yeni parol yazılmayıb' };
    }

    const user = await this.findUserOne(id);
    this.consoleLogger.log(user);

    if (!user) {
      return { message: 'İstifadəçi mövcud deyil' };
    }

    if (user.password === newPassword) {
      return { message: 'parolu düzgün daxil etmisiniz' };
    }

    const secretWord = this.configService.get<string>('SECRET');

    if (secretWord === secret) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Обновляем пароль пользователя в базе данных
      user.password = hashedPassword;
      await user.save();

      return { ...user.dataValues, message: 'parol yeniləndi' };
    } else {
      return { message: 'gizli söz səhv yazılıb' };
    }
  }

  async getDoneSecret(secret: string): Promise<boolean> {
    const secretWord = this.configService.get<string>('SECRET');
    return secret === secretWord ? true : false;
  }

  async findUsersNames(): Promise<string[]> {
    const users = await this.userModel.findAll();
    const names = users.map((user) => user.username);

    const sortedNames = names.sort((a, b) => a.localeCompare(b));
    return sortedNames;
  }

  async removeUserById(id: number) {
    if (isNaN(id)) return { errorMessage: 'rəqəmlər deyil!' };
    if (id <= 0) return { errorMessage: 'id 0-dan böyük olmalıdır !' };

    const removeUser = await this.userModel.findByPk(id);
    if (!removeUser) {
      return { errorMessage: `verilənlər bazasında deyil: ${id}!` };
    }

    removeUser.destroy();
    return `${removeUser.username} silindi`;
  }
}
