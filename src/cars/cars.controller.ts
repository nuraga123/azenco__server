import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import {
  ICarResponce,
  ICarsResponce,
  IMessageCarResponce,
  ICarsQuery,
} from './types';
import { NewCarDto } from './dto/new-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {
    /**/
  }

  @Get()
  async getAllCars(@Query() query: ICarsQuery): Promise<ICarsResponce> {
    return await this.carsService.getAllCars(query);
  }

  @Get(':id')
  async getCarById(@Param('id') id: number): Promise<ICarResponce> {
    return await this.carsService.getCarById(id);
  }

  @Post('add')
  async createCar(@Body() newCarDto: NewCarDto): Promise<IMessageCarResponce> {
    return await this.carsService.createCar(newCarDto);
  }

  @Put('update/:id')
  async updateCar(
    @Param('id') id: number,
    @Body() updateCarDto: UpdateCarDto,
  ): Promise<IMessageCarResponce> {
    return await this.carsService.updateCar(id, updateCarDto);
  }

  @Delete('delete/:id')
  async deleteCar(@Param('id') id: number): Promise<IMessageCarResponce> {
    return await this.carsService.deleteCar(id);
  }
}
