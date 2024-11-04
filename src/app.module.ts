import { Module } from '@nestjs/common';
import { TripModule } from './modules/trip/trip.module';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TripModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
})
export class AppModule {}
