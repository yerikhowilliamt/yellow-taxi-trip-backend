import { Module } from '@nestjs/common';
import { TripModule } from './modules/trip/trip.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    TripModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
