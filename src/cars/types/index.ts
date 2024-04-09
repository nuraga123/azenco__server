import { Car } from '../car.model';

export interface ICarResponce {
  car?: Car;
  errorMessage?: string;
}

export interface ICarsResponce extends ICarResponce {
  count: number;
  rows: Car[];
}

export interface IMessageCarResponce extends ICarResponce {
  message?: string;
}

export interface ICarsQuery {
  limit: string;
  offset: string;
}

export interface IFindCars extends ICarResponce {
  cars?: Car[];
}
