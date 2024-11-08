import {
  Inject,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import pool from '../../config/database.provider';
import { GetTripRequest, TripResponse } from '../../models/trip.model';
import { ValidationService } from '../../common/validation.service';
import { TripValidation } from './trip.validation';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ZodError } from 'zod';
import WebResponse from '../../models/web.model';

@Injectable()
export class TripService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
  ) {}

  private apiUrl = process.env.API_URL;

  private toTripsResponse(trip: any): TripResponse {
    return {
      id: trip.id,
      vendor_id: trip.vendor_id,
      pickup_datetime: trip.pickup_datetime,
      dropoff_datetime: trip.dropoff_datetime,
      passenger_count: trip.passenger_count,
      trip_distance: trip.trip_distance,
      pickup_location: trip.pickup_location,
      dropoff_location: trip.dropoff_location,
      payment_type: trip.payment_type,
      fare_amount: trip.fare_amount,
      mta_tax: trip.mta_tax,
      tip_amount: trip.tip_amount,
      tolls_amount: trip.tolls_amount,
      total_amount: trip.total_amount,
      imp_surcharge: trip.imp_surcharge,
      rate_code: trip.rate_code,
    };
  }

  private buildQueryWithFilters(
    request: GetTripRequest,
    values: any[],
  ): string {
    let query = `
    SELECT id, vendor_id, pickup_datetime, dropoff_datetime, passenger_count, 
           trip_distance, ST_AsGeoJSON(pickup_location) AS pickup_location, 
           ST_AsGeoJSON(dropoff_location) AS dropoff_location, payment_type, 
           fare_amount, mta_tax, tip_amount, tolls_amount, total_amount, 
           imp_surcharge, rate_code 
    FROM trips
  `;

    const conditions: string[] = [];

    if (request.startDateTime) {
      conditions.push(`pickup_datetime >= $${values.length + 1}`);
      values.push(request.startDateTime);
    }
    if (request.endDateTime) {
      conditions.push(`dropoff_datetime <= $${values.length + 1}`);
      values.push(request.endDateTime);
    }
    if (request.minFare !== undefined) {
      conditions.push(`fare_amount >= $${values.length + 1}`);
      values.push(request.minFare);
    }
    if (request.maxFare !== undefined) {
      conditions.push(`fare_amount <= $${values.length + 1}`);
      values.push(request.maxFare);
    }
    if (request.minDistance !== undefined) {
      conditions.push(`trip_distance >= $${values.length + 1}`);
      values.push(request.minDistance);
    }
    if (request.maxDistance !== undefined) {
      conditions.push(`trip_distance <= $${values.length + 1}`);
      values.push(request.maxDistance);
    }
    if (request.paymentType) {
      conditions.push(`payment_type = $${values.length + 1}`);
      values.push(request.paymentType);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    return query;
  }

  private async executeQuery(
    query: string,
    values: any[],
    limit: number,
    offset: number,
  ): Promise<any> {
    const finalQuery = `${query} LIMIT ${limit} OFFSET ${offset}`;

    this.logger.info(
      `Executing query: ${finalQuery} with values: ${JSON.stringify(values)}`,
    );

    return await pool.query(finalQuery, values);
  }

  private async getTotalFilteredTrips(
    query: string,
    values: any[],
  ): Promise<number> {
    const totalFilteredQuery = `SELECT COUNT(*) FROM (${query}) AS filteredTrips`;
    const result = await pool.query(totalFilteredQuery, values);
    return parseInt(result.rows[0].count, 10);
  }

  async fetchAndStoreTaxiData(): Promise<{ message: string }> {
    try {
      const response = await axios.get(this.apiUrl);
      const data = response.data;

      for (const trip of data) {
        const pickupPoint = {
          type: 'Point',
          coordinates: [
            parseFloat(trip.pickup_longitude),
            parseFloat(trip.pickup_latitude),
          ],
        };

        const dropoffPoint = {
          type: 'Point',
          coordinates: [
            parseFloat(trip.dropoff_longitude),
            parseFloat(trip.dropoff_latitude),
          ],
        };

        const query = `
          INSERT INTO trips (
            vendor_id, pickup_datetime, dropoff_datetime, passenger_count, 
            trip_distance, pickup_location, dropoff_location, payment_type, 
            fare_amount, mta_tax, tip_amount, tolls_amount, total_amount, 
            imp_surcharge, rate_code
          ) VALUES ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6), ST_GeomFromGeoJSON($7), 
            $8, $9, $10, $11, $12, $13, $14, $15)
        `;

        const values = [
          trip.vendor_id,
          trip.pickup_datetime,
          trip.dropoff_datetime,
          parseInt(trip.passenger_count),
          parseFloat(trip.trip_distance),
          JSON.stringify(pickupPoint),
          JSON.stringify(dropoffPoint),
          trip.payment_type,
          parseFloat(trip.fare_amount),
          parseFloat(trip.mta_tax),
          parseFloat(trip.tip_amount),
          parseFloat(trip.tolls_amount),
          parseFloat(trip.total_amount),
          parseFloat(trip.imp_surcharge),
          trip.rate_code,
        ];

        await pool.query(query, values);
      }

      return { message: 'Stored data successfully' };
    } catch (error) {
      this.logger.error(
        `Error fetching and storing taxi data: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to fetch and store taxi data',
      );
    }
  }

  async getTrips(
    limit: number = 10,
    page: number = 1,
  ): Promise<WebResponse<TripResponse[]>> {
    try {
      const offset = (page - 1) * limit;

      this.logger.info(
        `Fetching trips with limit: ${limit}, offset: ${offset}`,
      );

      const result = await pool.query(
        `SELECT id, vendor_id, pickup_datetime, dropoff_datetime, passenger_count,
                trip_distance, ST_AsGeoJSON(pickup_location) AS pickup_location,
                ST_AsGeoJSON(dropoff_location) AS dropoff_location, payment_type,
                fare_amount, mta_tax, tip_amount, tolls_amount, total_amount,
                imp_surcharge, rate_code
         FROM trips
         ORDER BY id
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const totalTripsResult = await pool.query(`SELECT COUNT(*) FROM trips`);
      const totalTrips = parseInt(totalTripsResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalTrips / limit);

      if (result.rows.length === 0) {
        throw new NotFoundException('No trips found');
      }

      return {
        data: result.rows.map((trip) =>
          this.toTripsResponse({
            ...trip,
            pickup_location: JSON.parse(trip.pickup_location),
            dropoff_location: JSON.parse(trip.dropoff_location),
          }),
        ),
        paging: {
          size: limit,
          total_page: totalPages,
          current_page: page,
        },
      };
    } catch (error) {
      this.logger.error(`Error retrieving trips: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve trips');
    }
  }

  async getFilteredTrips(
    request: GetTripRequest,
    limit: number = 10,
    page: number = 1,
  ): Promise<WebResponse<TripResponse[]>> {
    try {
      const getRequest: GetTripRequest = await this.validationService.validate(
        TripValidation.FILTERED,
        request,
      );

      const values: any[] = [];
      const query = this.buildQueryWithFilters(getRequest, values);

      const offset = (page - 1) * limit;

      this.logger.info(
        `Final filtered trips query: ${query} with values: ${JSON.stringify(values)}`,
      );

      const result = await this.executeQuery(query, values, limit, offset);

      const totalFiltered = await this.getTotalFilteredTrips(query, values);
      const totalPages = Math.ceil(totalFiltered / limit);

      if (result.rows.length === 0) {
        throw new NotFoundException('No trips found for the given filters');
      }

      return {
        data: result.rows.map((trip) =>
          this.toTripsResponse({
            ...trip,
            pickup_location: JSON.parse(trip.pickup_location),
            dropoff_location: JSON.parse(trip.dropoff_location),
          }),
        ),
        paging: {
          size: limit,
          total_page: totalPages,
          current_page: page,
        },
      };
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(
          `Validation error during filtered trips retrieval: ${JSON.stringify(error.errors)}`,
        );
        throw new BadRequestException(
          'Invalid input parameters',
          error.message,
        );
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error retrieving filtered trips: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to retrieve filtered trips',
      );
    }
  }
}
