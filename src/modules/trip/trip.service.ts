import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import pool from '../../config/database.provider';

@Injectable()
export class TripService {
  private apiUrl = process.env.API_URL;

  async fetchAndStoreTaxiData() {
    const response = await axios.get(this.apiUrl);
    const data = response.data;

    for (const trip of data) {
      const pickupPoint = `POINT(${trip.pickup_longitude} ${trip.pickup_latitude})`;
      const dropoffPoint = `POINT(${trip.dropoff_longitude} ${trip.dropoff_latitude})`;

      const query = `
        INSERT INTO trips (
          vendor_id, pickup_datetime, dropoff_datetime, passenger_count, 
          trip_distance, pickup_location, dropoff_location, payment_type, 
          fare_amount, mta_tax, tip_amount, tolls_amount, total_amount, 
          imp_surcharge, rate_code
        ) VALUES ($1, $2, $3, $4, $5, ST_GeomFromText($6, 4326), ST_GeomFromText($7, 4326), 
          $8, $9, $10, $11, $12, $13, $14, $15)
      `;

      const values = [
        trip.vendor_id,
        trip.pickup_datetime,
        trip.dropoff_datetime,
        parseInt(trip.passenger_count),
        parseFloat(trip.trip_distance),
        pickupPoint,
        dropoffPoint,
        trip.payment_type,
        parseFloat(trip.fare_amount),
        parseFloat(trip.mta_tax),
        parseFloat(trip.tip_amount),
        parseFloat(trip.tolls_amount),
        parseFloat(trip.total_amount),
        parseFloat(trip.imp_surcharge),
        trip.rate_code,
      ];

      try {
        await pool.query(query, values);
      } catch (error) {
        console.error(`Error inserting trip data: ${error.message}`);
        throw new InternalServerErrorException(error)
      }
    }
  }

  async getTrips() {
    try {
      const result = await pool.query('SELECT * FROM trips');
      return result.rows;
    } catch (error) {
      console.error(`Error retrieving trips: ${error.message}`);
      throw error;
    }
  }

  async getFilteredTrips(
    pickupTime?: string,
    dropoffTime?: string,
    minFare?: number,
    maxFare?: number,
    minDistance?: number,
    maxDistance?: number,
    paymentType?: string
  ) {
    let query = 'SELECT * FROM trips WHERE 1=1';
    const values = [];

    if (pickupTime) {
      query += ' AND pickup_datetime >= $' + (values.length + 1);
      values.push(pickupTime);
    }
    if (dropoffTime) {
      query += ' AND dropoff_datetime <= $' + (values.length + 1);
      values.push(dropoffTime);
    }
    if (minFare !== undefined) {
      query += ' AND fare_amount >= $' + (values.length + 1);
      values.push(minFare);
    }
    if (maxFare !== undefined) {
      query += ' AND fare_amount <= $' + (values.length + 1);
      values.push(maxFare);
    }
    if (minDistance !== undefined) {
      query += ' AND trip_distance >= $' + (values.length + 1);
      values.push(minDistance);
    }
    if (maxDistance !== undefined) {
      query += ' AND trip_distance <= $' + (values.length + 1);
      values.push(maxDistance);
    }
    if (paymentType) {
      query += ' AND payment_type = $' + (values.length + 1);
      values.push(paymentType);
    }

    const result = await pool.query(query, values);
    return result.rows;
  }
}
