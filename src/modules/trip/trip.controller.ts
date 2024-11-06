import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { GetTripRequest, TripResponse } from '../../models/trip.model';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import WebResponse from '../../models/web.model';

@Controller('/api/yellow-taxi-trips')
export class TripController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly tripService: TripService,
  ) {}

  @Get('store-data')
  async storeData(): Promise<WebResponse<{ message: string }>> {
    try {
      this.logger.info('Starting data storage process');
      const result = await this.tripService.fetchAndStoreTaxiData();
      this.logger.info('Data stored successfully');
      return {
        data: {
          message: result.message,
        },
      };
    } catch (error) {
      this.logger.error('Error during data storage', {
        message: error.message,
      });
      throw new InternalServerErrorException('Failed to store taxi data');
    }
  }

  @Get()
  async getAllTrips(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<WebResponse<TripResponse[]>> {
    try {
      this.logger.info(
        'TRIP CONTROLLER | Fetching all trips from the database',
      );
      const trips = await this.tripService.getTrips(limit, page);
      this.logger.info('TRIP CONTROLLER | Fetched trips successfully', {
        count: trips.data.length,
      });
      return {
        ...trips,
        statusCode: 200,
        timestamp: new Date().toString()
      };
    } catch (error) {
      this.logger.error('Error retrieving trips from the database', {
        message: error.message,
      });
      throw new InternalServerErrorException('Failed to retrieve trips');
    }
  }

  @Get('filtered')
  async getFilteredTrips(
    @Query('startDateTime') startDateTime?: string,
    @Query('endDateTime') endDateTime?: string,
    @Query('minFare') minFare?: string,
    @Query('maxFare') maxFare?: string,
    @Query('minDistance') minDistance?: string,
    @Query('maxDistance') maxDistance?: string,
    @Query('paymentType') paymentType?: string,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<WebResponse<TripResponse[]>> {
    try {
      this.logger.info('Processing filtered trips request', {
        startDateTime,
        endDateTime,
        minFare,
        maxFare,
        minDistance,
        maxDistance,
        paymentType,
      });

      const parsedMinFare = minFare ? parseInt(minFare, 10) : undefined;
      const parsedMaxFare = maxFare ? parseInt(maxFare, 10) : undefined;
      const parsedMinDistance = minDistance
        ? parseInt(minDistance, 10)
        : undefined;
      const parsedMaxDistance = maxDistance
        ? parseInt(maxDistance, 10)
        : undefined;

      const request: GetTripRequest = {
        startDateTime,
        endDateTime,
        minFare: parsedMinFare,
        maxFare: parsedMaxFare,
        minDistance: parsedMinDistance,
        maxDistance: parsedMaxDistance,
        paymentType,
      };

      if (
        (minFare && isNaN(parsedMinFare)) ||
        (maxFare && isNaN(parsedMaxFare)) ||
        (minDistance && isNaN(parsedMinDistance)) ||
        (maxDistance && isNaN(parsedMaxDistance))
      ) {
        throw new BadRequestException('Invalid fare or distance values');
      }

      const trips = await this.tripService.getFilteredTrips(
        request,
        limit,
        page,
      );
      return {
        ...trips,
        statusCode: 200,
        timestamp: new Date().toString()
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn('No trips found', { message: error.message });
        throw error;
      } else if (error instanceof BadRequestException) {
        this.logger.error('Bad request error during filtered trips retrieval', {
          message: error.message,
        });
        throw new BadRequestException('Invalid request parameters');
      } else {
        this.logger.error('Error during filtered trips retrieval', {
          message: error.message,
        });
        throw new InternalServerErrorException(
          'Failed to retrieve filtered trips',
        );
      }
    }
  }
}
