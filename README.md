<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Yellow Taxi Trip Analytics Backend

## Deskripsi

Proyek backend untuk analisis data Yellow Taxi Trip menggunakan NestJS dan PostgreSQL dengan PostGIS untuk penyimpanan dan pengolahan data spasial. Backend ini menyediakan API untuk mengambil dan menyimpan data perjalanan taksi serta mendukung filter berdasarkan waktu, tarif, jarak, dan tipe pembayaran.


## Fitur

- **Pengambilan data perjalanan**: Mengambil data perjalanan taksi dari API socrata.
- **Penyimpanan ke database**: Menyimpan data yang diambil ke dalam database PostgreSQL.
- **Pencarian dengan filter**: Mengambil data perjalanan berdasarkan filter tertentu (seperti waktu, tarif, jarak, dan jenis pembayaran.).
- **Pagination**: Mendukung pagination untuk pengambilan data perjalanan dengan jumlah terbatas per halaman.


## Teknologi yang Digunakan

- **NestJS**: Framework untuk membangun aplikasi backend.
- **PostgreSQL**: Database untuk menyimpan data perjalanan taksi.
- **Axios**: Untuk mengambil data dari API eksternal.
- **Winston**: Untuk logging.
- **Zod**: Untuk validasi input.


## Prasyarat

Sebelum menjalankan proyek ini, pastikan telah menginstal:

- Node.js
- PostgreSQL
- NestJS CLI


## Instalasi

1. **Clone repositori ini:**

   ```bash
   git clone https://github.com/yerikhowilliamt/yellow-taxi-trip-backend.git
   cd yellow-taxi-trip-backend

2. Ubah konfigurasi database sesuai database kamu :
- file **.env**
  
   ```bash
   PORT=4000
   DATABASE_URL=postgres://username:password@hostname:port/database_name
   API_URL=https://data.cityofnewyork.us/resource/gkne-dk5s.json

3. Buat database baru dan tambahkan table trips di dalam postgreSQL dengan format seperti berikut :

   1.
   	```bash
   	CREATE EXTENSION postgis;
	```
   2.
  	```bash
	CREATE EXTENSION postgis_topology;
	```
   3.
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

5. Jalankan aplikasi dengan perintah "npm run start:dev" untuk development mode dan "npm run start" untuk production mode.


## Cara Menggunakan API

URL: yellow-taxi-trips.up.railway.app

1. Menyimpan Data Perjalanan
   - Endpoint: GET /api/yellow-taxi-trips/store-data
   - GET https://labour-ame-yerikho-william-ad71b689.koyeb.app/api/yellow-taxi-trips/store-data
   - Deskripsi: Mengambil data perjalanan taksi dari API Socrata dan menyimpannya ke dalam database.
     
   ![GET stored-data](https://github.com/user-attachments/assets/4fc2b35c-e4c3-413d-982b-01dedc2f39b1)

2. Fetching taxi trip data
   - Endpoint: GET /api/yellow-taxi-trips?page=1&limit=10
   - GET https://labour-ame-yerikho-william-ad71b689.koyeb.app/api/yellow-taxi-trips?page=1&limit=10
   - Deskripsi: Mengambil data perjalanan taksi dari database.

   ![GET data-trips](https://github.com/user-attachments/assets/cdfeadfe-54fb-46df-a628-c9cc6223b9cb)

3. Mengambil Perjalanan dengan Filter
   - Endpoint: GET /trips/filtered
   - GET https://labour-ame-yerikho-william-ad71b689.koyeb.app/api/yellow-taxi-trips/filtered?startDateTime=2014-01-10T00:00:00&endDateTime=2014-03-10T23:59:59&minFare=0&maxFare=5&minDistance=0&maxDistance=5&paymentType=CSH&page=1&limit=10
   - Deskripsi: Mengambil data perjalanan taksi dengan filter berdasarkan waktu, tarif, jarak, dan tipe pembayaran.
   - Parameter:
     - startDateTime (optional): Waktu dimulai.
     - endDateTime (optional): Waktu berakhir.
     - minFare (optional): Tarif minimum.
     - maxFare (optional): Tarif maksimum.
     - minDistance (optional): Jarak minimum.
     - maxDistance (optional): Jarak maksimum.
     - paymentType (optional): Tipe pembayaran ("CRD" : Card/kartu kredit & "CSH" : Cash/tunai).
     - limit (wajib): Jumlah maksimum data yang akan dikembalikan dalam satu halaman. Default adalah 10.
     - page (wajib): Nomor halaman data yang akan diambil. Default adalah 1.

   ![GET filtered](https://github.com/user-attachments/assets/4dfa7143-0905-4f25-ab23-a0c7199180b6)
