# Bug Bounty System - CA1 & CA2 Complete Backend

A gamified bug bounty system backend with authentication, user management, vulnerability reporting, and review functionality.

## Features

### CA1 Features ✅
- **User Management**: Create, read, update users
- **Vulnerability System**: Create and manage vulnerabilities  
- **Report System**: Submit and close vulnerability reports
- **Gamification**: Ranks, badges, shop system, leaderboard
- **Point System**: Users earn reputation points for reports

### CA2 Features ✅  
- **Authentication**: JWT-based user authentication
- **Password Security**: Bcrypt password hashing
- **User Registration/Login**: Secure user account creation
- **Reviews System**: Users can rate and review the platform

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and update JWT_SECRET
```

3. Run database migrations:
```sql
-- Run the SQL commands in configs/ca2_migrations.sql
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login

### Users (CA1)
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user

### Vulnerabilities (CA1)
- `POST /api/vulnerabilities` - Create vulnerability
- `GET /api/vulnerabilities` - Get all vulnerabilities

### Reports (CA1)
- `POST /api/reports` - Create report
- `PUT /api/reports/{id}` - Update report status

### Reviews (CA2)
- `POST /api/reviews` - Create review (requires auth)
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/my-reviews` - Get user's reviews (requires auth)
- `PUT /api/reviews/{id}` - Update review (requires auth)
- `DELETE /api/reviews/{id}` - Delete review (requires auth)

### Gamification
- `GET /api/leaderboard` - Get top users
- `GET /api/shop` - Get shop items
- `POST /api/shop/purchase` - Purchase item
- `PUT /api/shop/equip` - Equip item
- `GET /api/ranks/{user_id}` - Get user rank

## Database Schema

### Core Tables (CA1)
- `user` - User information with rank and reputation
- `vulnerability` - Vulnerability types and points
- `report` - Bug reports linking users to vulnerabilities
- `ranks` - User ranking system
- `badge` - Achievement badges
- `shopitems` - Purchasable items
- `userbadge` - User badge ownership
- `usershopitems` - User item inventory

### CA2 Additions
- `user` table: Added `email` and `password` columns
- `reviews` table: User reviews with ratings (1-5 stars)

## Architecture

```
ASSIGNMENT/
├── app.js              # Express app configuration
├── index.js            # Server entry point
├── routes/             # Route definitions
├── controllers/        # Business logic
├── middleware/         # Custom middleware
├── model/              # Database models
├── services/           # Database connection
└── configs/            # Configuration files
```
