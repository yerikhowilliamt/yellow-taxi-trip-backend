import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';

@Module({
  imports: [
    WinstonModule.forRoot({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  }),
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  ],
  providers: [
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
  exports: [ValidationService]
})
export class CommonModule {}
