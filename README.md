<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Yellow Taxi Trip Analytics Backend

## Deskripsi

Proyek backend untuk analisis data Yellow Taxi Trip menggunakan NestJS dan PostgreSQL dengan PostGIS untuk penyimpanan dan pengolahan data spasial. Backend ini menyediakan API untuk mengambil dan menyimpan data perjalanan taksi serta mendukung filter berdasarkan waktu, tarif, jarak, dan tipe pembayaran.

## Fitur

- Mengambil data perjalanan taksi dari API Socrata.
- Menyimpan data ke dalam database PostgreSQL dengan PostGIS.
- API untuk mengambil semua perjalanan taksi.
- Dukungan filter pada API berdasarkan waktu, tarif, jarak, dan tipe pembayaran.

## Prasyarat

Sebelum menjalankan proyek ini, pastikan telah menginstal:

- Node.js
- PostgreSQL
- NestJS CLI

## Instalasi

1. **Clone repositori ini:**

   ```bash
   git clone https://github.com/yerikhowilliamt/yellow-taxi-trip-backend.git
   cd repository-name

2. Ubah konfigurasi database sesuai database kamu

3. Buat database baru dan tambahkan table trips di dalam postgreSQL dengan format seperti berikut :
   ```bash
   CREATE EXTENSION postgis;
   ```
   ```bash
   CREATE EXTENSION postgis_topology;
   ```
   ```bash
   CREATE TABLE trips (
    		id SERIAL PRIMARY KEY,
    		vendor_id VARCHAR(50),
    		pickup_datetime TIMESTAMP,
    		dropoff_datetime TIMESTAMP,
    		passenger_count INTEGER,
    		trip_distance FLOAT,
    		pickup_location GEOGRAPHY(Point, 4326),
    		dropoff_location GEOGRAPHY(Point, 4326),
    		payment_type VARCHAR(50),
    		fare_amount FLOAT,
    		mta_tax FLOAT,
    		tip_amount FLOAT,
    		tolls_amount FLOAT,
    		total_amount FLOAT,
    		imp_surcharge FLOAT,
    		rate_code VARCHAR(50)
		);
   ```

5. Jalankan aplikasi dengan perintah 'npm run start'


## Cara Menggunakan API

1. Menyimpan Data Perjalanan
   - Endpoint: GET /trips/store-data
   - GET http://localhost:4000/trips/store-data
   - Deskripsi: Mengambil data perjalanan taksi dari API Socrata dan menyimpannya ke dalam database.

2. Fetching taxi trip data
   - Endpoint: GET /trips
   - GET http://localhost:4000/trips
   - Deskripsi: Mengambil data perjalanan taksi dari database.

3. Mengambil Perjalanan dengan Filter
   - Endpoint: GET /trips/filtered
   - http://localhost:4000/api/yellow-taxi-trips/filtered?pickupTime=2014-09-10T00:00:00&dropoffTime=2014-09-10T23:59:59&minFare=0&maxFare=20&minDistance=1.2&maxDistance=20&paymentType=CSH
   - Deskripsi: Mengambil data perjalanan taksi dengan filter berdasarkan waktu, tarif, jarak, dan tipe pembayaran.
   - Parameter:
     - startDateTime (optional): Waktu dimulai.
     - endDateTime (optional): Waktu berakhir.
     - minFare (optional): Tarif minimum.
     - maxFare (optional): Tarif maksimum.
     - minDistance (optional): Jarak minimum.
     - maxDistance (optional): Jarak maksimum.
     - paymentType (optional): Tipe pembayaran ("CRD" : Card/kartu kredit & "CSH" : Cash/tunai).
