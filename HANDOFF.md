# Temino Frontend Handoff

## Backend API

Base URL:
https://api.temino.co.tz

## Key Endpoints

### Search Trips

GET /api/trips/search/?route_code=DAR-ARU

### Get Trips

GET /api/trips/

### Create Booking

POST /api/bookings/create/

Example:
{
"trip_id": "...",
"seat_id": "...",
"passenger_name": "...",
"passenger_phone": "...",
"passenger_email": "...",
"amount": "35000.00"
}

---

## Expected Flow

1. Select origin & destination
2. Search trips
3. Select trip
4. Select seat
5. Enter passenger info
6. Payment (mock → Selcom later)
7. Show ticket confirmation

---

## Notes

- Backend is production ready
- Payments currently mock
- Real payment integration: Selcom (planned)

---

## Frontend Freedom

You are free to:

- Design UI/UX
- Structure components
- Choose patterns

Goal: Build a modern, scalable booking UI.
