# FlowGrid ERP - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ (running locally or remote connection)

## Installation Steps

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
npm run server:install
```

Or manually:

```bash
cd server
npm install
cd ..
```

### 3. Setup MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service)
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 4. Configure Environment Variables

Frontend (.env):
```
VITE_API_URL=http://localhost:5000/api
```

Backend (server/.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowgrid
JWT_SECRET=flowgrid-dev-secret-key-2024
NODE_ENV=development
CORS_ORIGIN=http://localhost:8081
```

### 5. Seed the Database

```bash
npm run server:seed
```

This will create:
- 5 test users with different roles
- 8 sample products
- 5 customers
- 5 employees
- 3 sample orders

### 6. Start Development Servers

#### Option A: Start both servers together (recommended)
```bash
npm run dev:all
```

#### Option B: Start servers separately

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run dev:server
```

## Access the Application

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## Test Credentials

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flowgrid.com | admin123 |
| Sales Manager | sales@flowgrid.com | sales123 |
| Sales Rep | john@flowgrid.com | john123 |
| Inventory Manager | inventory@flowgrid.com | inventory123 |
| HR Manager | hr@flowgrid.com | hr123 |

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get user profile (requires auth)

### Dashboard
- GET `/api/dashboard/stats` - Get dashboard statistics
- GET `/api/dashboard/analytics` - Get analytics data

### Products
- GET `/api/products` - List products (with filters)
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (admin/inventory_manager)
- PUT `/api/products/:id` - Update product (admin/inventory_manager)
- DELETE `/api/products/:id` - Delete product (admin/inventory_manager)
- GET `/api/products/low-stock` - Get low stock products

### Customers
- GET `/api/customers` - List customers
- GET `/api/customers/:id` - Get single customer
- POST `/api/customers` - Create customer
- PUT `/api/customers/:id` - Update customer
- DELETE `/api/customers/:id` - Delete customer

### Orders
- GET `/api/orders` - List orders
- GET `/api/orders/:id` - Get single order
- POST `/api/orders` - Create order
- PUT `/api/orders/:id` - Update order status
- PUT `/api/orders/:id/invoice` - Update invoice status

### Employees
- GET `/api/employees` - List employees
- GET `/api/employees/:id` - Get single employee
- POST `/api/employees` - Create employee (admin/hr_manager)
- PUT `/api/employees/:id` - Update employee (admin/hr_manager)
- POST `/api/employees/:id/payroll` - Add payroll record
- POST `/api/employees/:id/leave` - Add leave request
- PUT `/api/employees/leave/:leaveId` - Update leave request status

## Project Structure

```
flowgrid/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── lib/               # Utilities and API client
│   ├── pages/             # Page components
│   └── App.tsx            # Main app component
├── server/                # Backend Node.js/Express API
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── scripts/       # Utility scripts (seed, etc.)
│   │   └── index.ts       # Server entry point
│   └── package.json
└── package.json           # Frontend package.json

```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh` to test connection
- Check MONGODB_URI in server/.env
- Default connection: `mongodb://localhost:27017/flowgrid`

### Port Already in Use
- Frontend (8081): Change in package.json dev script
- Backend (5000): Change PORT in server/.env

### CORS Errors
- Ensure CORS_ORIGIN in server/.env matches frontend URL
- Default: `http://localhost:8081`

### Authentication Issues
- Clear localStorage in browser DevTools
- Re-seed database: `npm run server:seed`
- Check JWT_SECRET is set in server/.env

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **API Testing**: Use tools like Postman or Thunder Client
3. **Database GUI**: Use MongoDB Compass to view data
4. **Logs**: Check terminal output for errors
5. **TypeScript**: Run `npm run typecheck` to check for type errors

## Building for Production

```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Start production server
cd server
npm start
```

## Next Steps

1. Customize the seeded data in `server/src/scripts/seed.ts`
2. Add more API endpoints as needed
3. Implement real-time features with Socket.io
4. Add file upload functionality
5. Implement advanced analytics
6. Add email notifications
7. Implement role-based UI restrictions
8. Add data export features (CSV, PDF)
