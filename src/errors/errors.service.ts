import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { IErrorMessage } from './types';

@Injectable()
export class ErrorService {
  private readonly logger = new Logger(ErrorService.name);

  handleErrors(error: any): IErrorMessage {
    this.logger.error({ ...error });

    let errorMessage: string;

    if (error instanceof AxiosError) {
      errorMessage = `Axios Error: ${error.message}`;
    } else {
      errorMessage = `Unknown Error: ${error.message}`;
    }

    return { error_message: errorMessage };
  }
}
