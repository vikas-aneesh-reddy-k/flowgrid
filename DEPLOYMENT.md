# FlowGrid ERP - Complete Implementation Guide

## ✅ What's Been Built

### Backend (Node.js + Express + MongoDB)
- ✅ Complete REST API with TypeScript
- ✅ MongoDB models for all entities (User, Product, Customer, Order, Employee)
- ✅ JWT authentication with role-based access control
- ✅ CRUD operations for all resources
- ✅ Dashboard analytics and statistics
- ✅ Database seeding script with sample data
- ✅ Error handling and validation
- ✅ CORS and security middleware

### Frontend (React + TypeScript + Vite)
- ✅ API client with authentication
- ✅ React hooks for all API operations
- ✅ Updated Dashboard with real data
- ✅ Authentication context with API integration
- ✅ Loading states and error handling
- ✅ TypeScript types throughout

### Database Structure
- ✅ Users collection (with authentication)
- ✅ Products collection (inventory management)
- ✅ Customers collection (CRM)
- ✅ Orders collection (with embedded items and invoices)
- ✅ Employees collection (with payroll and leave requests)

## 🚀 Quick Start

### Prerequisites
1. Node.js 18+ installed
2. MongoDB 6+ installed and running
3. Git (optional)

### Installation

#### Windows
```cmd
# 1. Install dependencies
npm install
npm run server:install

# 2. Start MongoDB (if not running)
net start MongoDB

# 3. Seed database
npm run server:seed

# 4. Start both servers
start.bat
```

#### macOS/Linux
```bash
# 1. Install dependencies
npm install
npm run server:install

# 2. Start MongoDB (if not running)
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux

# 3. Seed database
npm run server:seed

# 4. Start both servers
chmod +x start.sh
./start.sh
```

### Manual Start
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🔐 Test Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@flowgrid.com | admin123 | Full access |
| Sales Manager | sales@flowgrid.com | sales123 | Sales, CRM, Orders |
| Sales Rep | john@flowgrid.com | john123 | CRM, Orders (limited) |
| Inventory Manager | inventory@flowgrid.com | inventory123 | Products, Inventory |
| HR Manager | hr@flowgrid.com | hr123 | Employees, Payroll, Leave |

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login
GET    /api/auth/profile       - Get user profile (auth required)
```

### Dashboard
```
GET    /api/dashboard/stats    - Get dashboard statistics
GET    /api/dashboard/analytics - Get analytics data
```

### Products
```
GET    /api/products           - List products (with filters)
GET    /api/products/:id       - Get single product
POST   /api/products           - Create product (admin/inventory_manager)
PUT    /api/products/:id       - Update product (admin/inventory_manager)
DELETE /api/products/:id       - Delete product (admin/inventory_manager)
GET    /api/products/low-stock - Get low stock products
```

### Customers
```
GET    /api/customers          - List customers
GET    /api/customers/:id      - Get single customer
POST   /api/customers          - Create customer
PUT    /api/customers/:id      - Update customer
DELETE /api/customers/:id      - Delete customer (admin/sales_manager)
```

### Orders
```
GET    /api/orders             - List orders
GET    /api/orders/:id         - Get single order
POST   /api/orders             - Create order (auto-updates inventory)
PUT    /api/orders/:id         - Update order status
PUT    /api/orders/:id/invoice - Update invoice status (accountant)
```

### Employees
```
GET    /api/employees          - List employees
GET    /api/employees/:id      - Get single employee
POST   /api/employees          - Create employee (admin/hr_manager)
PUT    /api/employees/:id      - Update employee (admin/hr_manager)
POST   /api/employees/:id/payroll - Add payroll record
POST   /api/employees/:id/leave   - Add leave request
PUT    /api/employees/leave/:leaveId - Update leave status
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (server/.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowgrid
JWT_SECRET=flowgrid-dev-secret-key-2024
NODE_ENV=development
CORS_ORIGIN=http://localhost:8081
```

## 📊 Sample Data

The seed script creates:
- 5 users with different roles
- 8 products (various categories and stock levels)
- 5 customers (different segments)
- 5 employees (different departments)
- 3 sample orders (with invoices)

## 🎯 Next Steps for Development

### Immediate Priorities
1. **Update remaining pages to use real API data**
   - CRM page (customers list)
   - Inventory page (products list)
   - Finance page (invoices)
   - HR page (employees)
   - Sales page (orders)

2. **Add Create/Edit Forms**
   - Product form with validation
   - Customer form
   - Order creation wizard
   - Employee form

3. **Implement Search and Filters**
   - Product search and category filter
   - Customer search and segment filter
   - Order status filter
   - Date range filters

### Medium Priority
4. **Add Data Tables**
   - Sortable columns
   - Pagination
   - Bulk actions
   - Export functionality

5. **Implement Role-Based UI**
   - Hide/show features based on user role
   - Disable actions user doesn't have permission for

6. **Add Notifications**
   - Toast notifications for actions
   - Real-time updates (Socket.io)
   - Email notifications

### Advanced Features
7. **Analytics & Reporting**
   - Sales reports
   - Inventory reports
   - Financial reports
   - Export to PDF/Excel

8. **File Uploads**
   - Product images
   - Employee documents
   - Invoice attachments

9. **Advanced Features**
   - Multi-currency support
   - Tax calculations
   - Discount management
   - Shipping integration

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Find and kill process on port 5000 (backend)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Find and kill process on port 8081 (frontend)
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8081 | xargs kill -9
```

### CORS Errors
- Ensure backend CORS_ORIGIN matches frontend URL
- Check that both servers are running
- Clear browser cache and localStorage

### Authentication Issues
- Clear localStorage in browser DevTools
- Re-seed database: `npm run server:seed`
- Check JWT_SECRET is set in server/.env

## 📁 Project Structure

```
flowgrid/
├── src/                          # Frontend
│   ├── components/               # React components
│   │   ├── dashboard/           # Dashboard widgets
│   │   ├── layout/              # Layout components
│   │   ├── sidebar/             # Sidebar navigation
│   │   └── ui/                  # shadcn/ui components
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Authentication
│   ├── hooks/                   # Custom React hooks
│   │   ├── useCustomers.ts      # Customer operations
│   │   ├── useDashboard.ts      # Dashboard data
│   │   ├── useEmployees.ts      # Employee operations
│   │   ├── useOrders.ts         # Order operations
│   │   └── useProducts.ts       # Product operations
│   ├── lib/                     # Utilities
│   │   ├── api.ts               # API client
│   │   └── utils.ts             # Helper functions
│   ├── pages/                   # Page components
│   └── App.tsx                  # Main app
├── server/                      # Backend
│   └── src/
│       ├── config/              # Configuration
│       │   └── database.ts      # MongoDB connection
│       ├── controllers/         # Route controllers
│       │   ├── authController.ts
│       │   ├── customerController.ts
│       │   ├── dashboardController.ts
│       │   ├── employeeController.ts
│       │   ├── orderController.ts
│       │   └── productController.ts
│       ├── middleware/          # Express middleware
│       │   ├── auth.ts          # JWT authentication
│       │   └── errorHandler.ts  # Error handling
│       ├── models/              # Mongoose models
│       │   ├── Customer.ts
│       │   ├── Employee.ts
│       │   ├── Order.ts
│       │   ├── Product.ts
│       │   └── User.ts
│       ├── routes/              # API routes
│       ├── scripts/             # Utility scripts
│       │   └── seed.ts          # Database seeding
│       └── index.ts             # Server entry
├── .env                         # Frontend environment
├── server/.env                  # Backend environment
├── start.bat                    # Windows startup script
├── start.sh                     # Unix startup script
└── README_SETUP.md              # Setup instructions
```

## 🎓 Learning Resources

- **Express.js**: https://expressjs.com/
- **MongoDB**: https://www.mongodb.com/docs/
- **Mongoose**: https://mongoosejs.com/
- **React Query**: https://tanstack.com/query/latest
- **shadcn/ui**: https://ui.shadcn.com/

## 📝 Notes

- All passwords are hashed with bcrypt
- JWT tokens expire after 7 days
- Database indexes are created automatically
- Stock levels update automatically when orders are created
- Customer stats update automatically with orders

## 🤝 Contributing

When adding new features:
1. Create model in `server/src/models/`
2. Create controller in `server/src/controllers/`
3. Create routes in `server/src/routes/`
4. Add to `server/src/index.ts`
5. Create API methods in `src/lib/api.ts`
6. Create React hooks in `src/hooks/`
7. Update UI components to use hooks

## 📄 License

This project is for educational purposes.
