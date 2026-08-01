# Ride Sharing Platform

A full-stack ride-sharing platform inspired by services like Uber and Ola. The application enables riders to book rides, drivers to manage ride requests, and administrators to monitor platform activity through a centralized dashboard.

## Features

### Rider
- User Registration & Login (JWT Authentication)
- Book rides
- View ride history
- Track active rides in real time
- Manage user profile

### Driver
- Accept or reject ride requests
- Update ride status
- View earnings
- Manage profile

### Admin
- Dashboard with analytics
- Manage riders and drivers
- Monitor ride activity
- View platform reports

### Additional Features
- Real-time ride tracking using Socket.IO
- Stripe payment integration
- Email notifications using Nodemailer
- Responsive UI with Dark Mode

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- Recharts

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT Authentication

### Database
- MySQL

### Other Tools
- Stripe
- Nodemailer

---

## Project Structure

```
Ride-Sharing-Platform/
│
├── frontend/
├── backend/
├── database.sql
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/Ride-Sharing-Platform.git
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in both frontend and backend.

### Backend

```env
PORT=5000
JWT_SECRET=your_secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ride_sharing
STRIPE_SECRET_KEY=your_key
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_public_key
```

---

## Screenshots

Add screenshots here.

- Login Page
- Rider Dashboard
- Driver Dashboard
- Admin Dashboard
- Ride Booking Page

---

## Future Enhancements

- Google Maps integration
- Live GPS tracking
- Ride scheduling
- Ratings & Reviews
- Push notifications

---

## Author

**Your Name**

B.Tech Computer Science Engineering

---

## License

MIT License