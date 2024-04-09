import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

import {
  ICarResponce,
  ICarsQuery,
  ICarsResponce,
  IFindCars,
  IMessageCarResponce,
} from './types';
import { Car } from './car.model';
import { NewCarDto } from './dto/new-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Op } from 'sequelize';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);

  constructor(
    @InjectModel(Car)
    private carModel: typeof Car,
  ) {
    /**/
  }

  // возврашает ошибку
  async errorsMessage(e: any): Promise<{ errorMessage: string }> {
    this.logger.log(e);
    return { errorMessage: (e as AxiosError).message };
  }

  // возврашает все машины
  async getAllCars(query: ICarsQuery): Promise<ICarsResponce> {
    const { limit, offset } = query;
    return await this.carModel.findAndCountAll({
      limit: +limit,
      offset: +offset * 20,
    });
  }

  // ишет машину по id
  async getCarById(id: number): Promise<ICarResponce> {
    const car = await this.carModel.findByPk(id);
    if (!car) return { errorMessage: 'нет машины' };
    return { car };
  }

  // ишет машину по имени
  async getCarByName(id: string): Promise<ICarResponce> {
    const car = await this.carModel.findByPk(id);
    if (!car) return { errorMessage: 'не найдено имя машины' };
    return { car };
  }

  // ишет машину по номеру
  async getCarByNumber(carNumber: string): Promise<ICarResponce> {
    const car = await this.carModel.findOne({ where: { carNumber } });
    if (!car) return { errorMessage: 'не найден номер машины' };
    return { car };
  }

  // ишет по части имени
  async findCarsByPartName(part_name: string) {
    const cars = await this.carModel.findAll({
      where: {
        name: { [Op.like]: `%${part_name}%` },
      },
    });

    if (!cars.length) return { errorMessage: `не существует ${part_name} ` };

    return cars;
  }

  // ишет по части имени
  async findCarsByPartCarNumber(part_car_number: string): Promise<IFindCars> {
    const cars = await this.carModel.findAll({
      where: {
        carNumber: { [Op.like]: `%${part_car_number}%` },
      },
    });

    if (!cars.length) {
      return { errorMessage: `не существует ${part_car_number}` };
    }

    return { cars };
  }

  // создает машину
  async createCar(newCarDto: NewCarDto): Promise<IMessageCarResponce> {
    try {
      const { name, carNumber } = newCarDto;
      if (!name || !carNumber) return { errorMessage: 'нет данных !' };

      if (typeof name === 'string' || typeof carNumber === 'string') {
        return { errorMessage: 'некорректные данные' };
      }

      const existingCarName = await this.getCarByName(name);

      if (existingCarName?.car?.name) {
        return { errorMessage: `${name} уже существует !` };
      }

      const existingCarNumber = await this.getCarByNumber(carNumber);

      if (existingCarNumber?.car?.carNumber) {
        return { errorMessage: `${carNumber} уже существует !` };
      }

      const createdCar = await this.carModel.create(newCarDto);
      return {
        message: `${createdCar.name}; ${createdCar.carNumber} создана`,
        car: createdCar,
      };
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // обновляет машину
  async updateCar(
    id: number,
    updateCarDto: UpdateCarDto,
  ): Promise<IMessageCarResponce> {
    const { car, errorMessage } = await this.getCarById(id);
    if (errorMessage) return { errorMessage };

    if (!updateCarDto?.name || updateCarDto?.name === car?.name) {
      updateCarDto.name = car.name;
    }

    if (!updateCarDto?.carNumber || updateCarDto?.carNumber === car?.name) {
      updateCarDto.carNumber = car.carNumber;
    }

    await car.update(updateCarDto);
    return { message: `${car.name} был обновлен`, car };
  }

  // удаляет машину
  async deleteCar(id: number): Promise<IMessageCarResponce> {
    const { car, errorMessage } = await this.getCarById(id);
    if (errorMessage) return { errorMessage };
    await car.destroy();
    return { message: `${car.name} был удален` };
  }
}
