import { Module } from '@nestjs/common';
import { ErrorService } from './errors.service';

@Module({
  providers: [ErrorService],
  exports: [ErrorService],
})
export class ErrorsModule {}
