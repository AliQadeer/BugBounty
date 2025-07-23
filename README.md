# Bug Bounty System - Complete CA1 & CA2 Implementation

A fully-featured gamified bug bounty system with backend API and frontend interface, implementing all CA1 and CA2 requirements with enhanced gamification features.

## 🎯 Features

### CA1 Backend Features ✅
- **User Management**: Complete CRUD operations for users
- **Vulnerability System**: Create and manage vulnerability types
- **Report System**: Submit and close vulnerability reports with reputation rewards
- **Gamification**: 7-tier ranking system, achievement badges, shop with 20+ items
- **Point System**: Dynamic reputation system with rank progression

### CA2 Frontend Features ✅  
- **Authentication**: JWT-based secure login/registration system
- **Password Security**: BCrypt password hashing
- **Frontend Interface**: Complete web application with 6 main pages
- **Reviews System**: 1-5 star rating system with CRUD operations
- **Responsive Design**: Fantasy-themed UI with animations and effects

## 🚀 Quick Setup Guide

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **npm** package manager

### Step 1: Clone and Install
```bash
git clone [repository-url]
cd ASSIGNMENT
npm install
```

### Step 2: Database Configuration
1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your MySQL credentials:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_DATABASE=bugbountyca1
   JWT_SECRET=your_secure_jwt_secret_key
   ```

3. **Generate a secure JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Step 3: Database Setup
```bash
# Create database
npm run db:create

# Create tables and seed data
npm run db:init
```

### Step 4: Start the Server
```bash
# Production mode
npm start

# Development mode (auto-restart)
npm run dev
```

🌐 **Access the application at: http://localhost:3000**

## 📱 Frontend Pages

### Authentication Flow
- **Login/Register Page** (`/index.html`) - User authentication with form validation
- **Home Dashboard** (`/home.html`) - Main interface showing user stats and vulnerabilities

### Core Features
- **Profile Page** (`/profile.html`) - User statistics, badges, equipment management
- **Leaderboard** (`/leaderboard.html`) - Top players ranking system
- **Reviews System** (`/reviews.html`) - Platform rating and feedback system
- **Shop** (`/shop.html`) - Purchase and equip cosmetic items
- **Play Page** (`/play.html`) - Vulnerability reporting interface

## 🔌 API Endpoints

### 🔐 Authentication (CA2)
```http
POST /api/users/register    # Register new user
POST /api/users/login       # User login
```

### 👥 Users (CA1 - Required Endpoints)
```http
POST /api/users            # Create user
GET  /api/users            # Get all users  
GET  /api/users/{id}       # Get user by ID
PUT  /api/users/{id}       # Update user
```

### 🔍 Vulnerabilities (CA1 - Required Endpoints)
```http
POST /api/vulnerabilities  # Create vulnerability
GET  /api/vulnerabilities  # Get all vulnerabilities
```

### 📋 Reports (CA1 - Required Endpoints)
```http
POST /api/reports          # Create report
PUT  /api/reports/{id}     # Update report status
```

### ⭐ Reviews (CA2 - Required Feature)
```http
POST   /api/reviews                # Create review (requires auth)
GET    /api/reviews                # Get all reviews
GET    /api/reviews/my-reviews     # Get user's reviews (requires auth)
PUT    /api/reviews/{id}           # Update review (requires auth) 
DELETE /api/reviews/{id}           # Delete review (requires auth)
```

### 🎮 Gamification (Section B - Enhanced Features)
```http
GET  /api/leaderboard           # Get top users leaderboard
GET  /api/shop                  # Get shop items
POST /api/shop/purchase         # Purchase item
GET  /api/ranks/{user_id}       # Get user rank information
```

## 🗄️ Database Schema

### Core Tables (CA1 Requirements)
- **`user`** - User profiles with authentication (id, username, email, password, reputation, rank_id)
- **`vulnerability`** - Vulnerability types and point values (id, type, description, points)
- **`report`** - Bug reports linking users to vulnerabilities (id, user_id, vulnerability_id, status)
- **`ranks`** - 7-tier ranking system (Bronze → Grandmaster)

### Gamification Tables (Section B)
- **`badge`** - Achievement badges for vulnerability types
- **`shopitems`** - 20+ purchasable cosmetic items (hats, capes, gloves, masks, boots)
- **`userbadge`** - User badge ownership tracking
- **`usershopitems`** - User item inventory and equipment status

### CA2 Additions
- **`reviews`** - User reviews with 1-5 star ratings (id, user_id, rating, comment, timestamps)

## 🏗️ Project Architecture

```
ASSIGNMENT/
├── 📁 configs/          # Database setup scripts
├── 📁 controllers/      # Business logic (7 controllers)
├── 📁 middleware/       # Custom middleware (25+ functions)
├── 📁 model/           # Database models (7 models)
├── 📁 routes/          # API route definitions (8 route files)
├── 📁 services/        # Database connection
├── 📁 public/          # Frontend static files
│   ├── 📁 css/         # Stylesheets for each page
│   ├── 📁 js/          # Frontend JavaScript
│   ├── 📁 images/      # Game assets and UI elements
│   └── 📄 *.html       # 6 main application pages
├── 📄 app.js           # Express configuration
├── 📄 index.js         # Server entry point
└── 📄 package.json     # Dependencies and scripts
```

## 🧪 Testing the Application

### Default Test Users
After running the database setup, you can login with:
- **Username:** `testuser1` | **Password:** `password123`
- **Username:** `testuser2` | **Password:** `password123`

### Testing Workflow
1. **Register/Login** at `http://localhost:3000/index.html`
2. **Explore Features:**
   - View vulnerabilities on Home page
   - Submit bug reports on Play page  
   - Check profile and badges
   - Browse and purchase shop items
   - Leave reviews on Reviews page
   - Check leaderboard rankings

### API Testing
Use tools like **Postman** or **curl** to test the API endpoints. Authentication endpoints require proper request bodies, while protected routes need JWT tokens in headers.

## 🔧 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check if MySQL is running
sudo service mysql status

# Restart MySQL if needed
sudo service mysql restart
```

**Permission Errors:**
- Ensure your MySQL user has proper database creation permissions
- Update credentials in `.env` file

**Port Already in Use:**
- Change the PORT in your `.env` file
- Or kill the process using port 3000: `lsof -t -i:3000 | xargs kill`

**JWT Token Issues:**
- Ensure JWT_SECRET is properly set in `.env`
- Check that the secret is at least 32 characters long

### Reset Database
```bash
# Completely reset and recreate database
npm run db:create
npm run db:init
```

## 📋 Requirements Compliance

### ✅ CA1 Backend (All 8 Endpoints Implemented)
- [x] POST /users - Create user
- [x] GET /users - Get all users  
- [x] GET /users/{id} - Get user by ID
- [x] PUT /users/{id} - Update user
- [x] POST /vulnerabilities - Create vulnerability
- [x] GET /vulnerabilities - Get all vulnerabilities
- [x] POST /reports - Create report
- [x] PUT /reports/{id} - Update report status

### ✅ CA2 Frontend (All Requirements Met)
- [x] User Registration/Login pages with authentication
- [x] JWT implementation with BCrypt password hashing
- [x] Complete frontend integration with backend APIs
- [x] Reviews system with 1-5 star ratings and CRUD operations
- [x] Responsive web interface with 6 main pages

### ✅ Section B Gamification (Exceeded Requirements)
- [x] 7-tier ranking system with progression
- [x] Achievement badge system
- [x] Virtual shop with 20+ cosmetic items
- [x] Equipment system with visual customization  
- [x] Leaderboard with top players

## 📝 License

This project is developed for educational purposes as part of the ST0503 Backend Web Development course.
