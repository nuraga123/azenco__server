import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { IErrorMessage } from './types';

@Injectable()
export class ErrorService {
  private readonly logger = new Logger(ErrorService.name);

  errorsMessage(error?: any): IErrorMessage {
    this.logger.error({ ...error });
    return { error_message: `Error ${(error as AxiosError)?.message}` };
  }

  log(data: any) {
    this.logger.log(`DATA --- ${data}`);
    this.logger.log({ ...data });
  }
}
