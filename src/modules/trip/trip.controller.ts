import { Controller, Get, Query } from '@nestjs/common';
import { TripService } from './trip.service';

@Controller('/api/yellow-taxi-trips')
export class TripController {
  constructor(private readonly tripService: TripService) { }
  
  @Get('store-data')
  async storeData() {
    await this.tripService.fetchAndStoreTaxiData();
    return { message: 'Data stored successfully' };
  }

  @Get()
  async getAllTrips() {
    return await this.tripService.getTrips();
  }

  @Get('filtered')
  async getFilteredTrips(
    @Query('pickupTime') pickupTime?: string,
    @Query('dropoffTime') dropoffTime?: string,
    @Query('minFare') minFare?: number,
    @Query('maxFare') maxFare?: number,
    @Query('minDistance') minDistance?: number,
    @Query('maxDistance') maxDistance?: number,
    @Query('paymentType') paymentType?: string
  ) {
    return await this.tripService.getFilteredTrips(
      pickupTime,
      dropoffTime,
      minFare,
      maxFare,
      minDistance,
      maxDistance,
      paymentType
    );
  }
}
