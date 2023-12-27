import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findOne(filter: {
    where: {
      id?: string;
      username?: string;
      password?: string;
      email?: string;
    };
  }): Promise<User> {
    return await this.userModel.findOne({ ...filter });
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<User | { warningMessage: string }> {
    const user = new User();
    // проверка был ли зарегестрирован
    const existingByUserName = await this.findOne({
      where: { username: createUserDto.username },
    });

    const existingByEmail = await this.findOne({
      where: { email: createUserDto.email },
    });

    if (existingByUserName) {
      return {
        warningMessage: `bu ad artıq qeydiyyatdan keçib: ${createUserDto.username}`,
      };
    }

    if (existingByEmail) {
      return {
        warningMessage: `Bu email artıq qeydiyyatdan keçib: ${createUserDto.email}`,
      };
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    user.username = createUserDto.username;
    user.password = hashedPassword;
    user.email = createUserDto.email;

    return user.save();
  }
}
