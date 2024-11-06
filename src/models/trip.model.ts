export class TripResponse {
  id: number;
  vendor_id: string;
  pickup_datetime: string;
  dropoff_datetime: string;
  passenger_count: number;
  trip_distance: number;
  pickup_location: GeoJSON.Point;
  dropoff_location: GeoJSON.Point;
  payment_type: string;
  fare_amount: number;
  mta_tax: number;
  tip_amount: number;
  tolls_amount: number;
  total_amount: number;
  imp_surcharge: number;
  rate_code: string;
}

export class GetTripRequest {
  startDateTime?: string;
  endDateTime?: string;
  minFare?: number;
  maxFare?: number;
  minDistance?: number;
  maxDistance?: number;
  paymentType?: string;
}