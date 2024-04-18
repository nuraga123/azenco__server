import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { IErrorMessage } from '../../errors/types';

@Injectable()
export class BrokenAnbarService {
  private readonly logger = new Logger(BrokenAnbarService.name);

  async errorsMessage(error: any): Promise<IErrorMessage> {
    this.logger.log({ ...error });
    return {
      error_message: `Anbar Error: ${(error as AxiosError).message}!`,
    };
  }
}
