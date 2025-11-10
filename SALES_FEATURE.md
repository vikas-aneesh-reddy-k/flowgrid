# Sales & CRM Feature - New Lead Functionality

## Overview
The "New Lead" button in the Sales & CRM page is now fully functional and connected to the database. This feature allows you to manage your sales pipeline from lead generation to customer conversion.

## What the Sales Pipeline Section Does

### Sales Pipeline Visualization
The **Sales Pipeline** section tracks deals through your sales process in four stages:

1. **Lead Stage** (Blue)
   - New prospects who have shown interest
   - Initial contact made
   - Qualification in progress
   - Example: 24 deals worth $125,000

2. **Qualified Stage** (Yellow)
   - Leads that meet your criteria
   - Budget confirmed
   - Decision-maker identified
   - Active engagement
   - Example: 18 deals worth $280,000

3. **Proposal Stage** (Purple)
   - Formal proposal sent
   - Pricing discussed
   - Contract negotiation
   - Close to decision
   - Example: 12 deals worth $420,000

4. **Closed Stage** (Green)
   - Deal won
   - Contract signed
   - Customer onboarded
   - Revenue recognized
   - Example: 8 deals worth $380,000

### Purpose
- **Track Progress**: Visualize where each deal is in your sales process
- **Forecast Revenue**: See potential revenue at each stage
- **Identify Bottlenecks**: Spot stages where deals get stuck
- **Measure Performance**: Track conversion rates between stages
- **Prioritize Efforts**: Focus on high-value deals

## What Was Implemented

### Frontend (src/pages/Sales.tsx)
- ✅ Functional "New Lead" dialog with comprehensive form
- ✅ Form validation for required fields
- ✅ Real-time metrics from database
- ✅ Integration with `useCreateCustomer` hook
- ✅ Automatic form reset after successful creation
- ✅ Loading states and skeleton screens
- ✅ Real orders display with status colors
- ✅ Customer segment selection (Enterprise, SMB, Startup)

### Backend (Already Implemented)
- ✅ Customer/Lead creation endpoint
- ✅ Duplicate email detection
- ✅ Customer statistics tracking (totalOrders, totalValue)
- ✅ Segment-based organization
- ✅ Status management (active, premium, inactive)

### Data Flow
1. User clicks "New Lead" button
2. Dialog opens with lead capture form
3. User fills in contact information and segment
4. Frontend validates required fields (name, email, phone)
5. API call to `/api/customers` with lead data
6. Backend creates customer record with status "active"
7. Returns customer data to frontend
8. Frontend updates customer list and metrics
9. Dashboard metrics refresh automatically

## Form Fields

### Required Fields
- **Full Name**: Contact person's name
- **Email**: Primary email address
- **Phone**: Contact phone number
- **Customer Segment**: Enterprise, SMB, or Startup

### Optional Fields
- **Company**: Company name
- **Street Address**: Physical address
- **City**: City name
- **State**: State/Province
- **Zip Code**: Postal code

## Metrics Explained

### Total Customers
- Count of all customers in the database
- Includes both leads and paying customers
- Updates in real-time when new leads are added

### Active Leads
- Customers with status "active" and 0 orders
- These are prospects who haven't purchased yet
- Your sales pipeline opportunities

### Conversion Rate
- Percentage of leads that became customers
- Formula: (Customers with orders / Total customers) × 100
- Measures sales effectiveness

### Monthly Sales
- Total revenue from orders this month
- Calculated from current month's orders
- Shows number of orders alongside revenue

## Customer Segments

### Enterprise
- Large corporations
- High-value deals
- Complex sales cycles
- Multiple decision-makers

### SMB (Small & Medium Business)
- Growing companies
- Mid-range deals
- Moderate sales cycles
- Practical decision-making

### Startup
- New companies
- Budget-conscious
- Quick decisions
- Growth potential

## Lead Lifecycle

### 1. Lead Creation (New Lead Button)
```
Status: active
Total Orders: 0
Total Value: $0
```

### 2. Lead Qualification
- Sales team contacts lead
- Assesses fit and budget
- Moves through pipeline stages
- Updates contact information

### 3. First Purchase
```
Status: active → premium (if high value)
Total Orders: 1
Total Value: $X,XXX
```

### 4. Customer Relationship
- Ongoing orders tracked
- Total value accumulates
- Status can be upgraded to "premium"
- Last contact date updated

## Testing

Run the test script to verify functionality:
```bash
node test-lead.js
```

Expected output:
- ✓ Login successful
- ✓ Lead created successfully
- ✓ Total customers count increases
- ✓ Active leads count increases
- ✅ All tests passed

## Integration Points

### Hooks
- `useCreateCustomer()` - Mutation hook for creating leads
- `useCustomers()` - Query hook for fetching customer list
- `useOrders()` - Query hook for fetching orders
- Invalidates both 'customers' and 'dashboard' queries on success

### API Endpoints
- `POST /api/customers` - Create new lead/customer
- `GET /api/customers` - List all customers
- `GET /api/orders` - List all orders (for metrics)

### Components
- Sales.tsx - Main sales page with CRM features
- Dialog component for lead creation form
- Toast notifications for user feedback
- Skeleton loaders for better UX

## Real-time Features

### Automatic Updates
- Customer list refreshes after lead creation
- Dashboard metrics update automatically
- Order list shows latest transactions
- Conversion rate recalculates

### Status Colors
- **Green**: Delivered orders, success states
- **Yellow**: Processing, pending states
- **Red**: Cancelled, error states
- **Blue**: Information, lead stage

## Database Schema

### Customer/Lead Record
```javascript
{
  name: "Test Lead",
  email: "test.lead@example.com",
  phone: "+1-555-7777",
  company: "Test Company Inc",
  segment: "SMB",
  status: "active",
  address: {
    street: "456 Business Ave",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102"
  },
  totalOrders: 0,
  totalValue: 0,
  lastContact: null,
  createdAt: "2025-11-10T...",
  updatedAt: "2025-11-10T..."
}
```

## Best Practices

### Lead Management
1. **Capture leads quickly** - Use the New Lead button immediately
2. **Segment properly** - Choose the right customer segment
3. **Complete information** - Fill in all available fields
4. **Follow up promptly** - Track last contact date
5. **Monitor pipeline** - Watch conversion rates

### Sales Process
1. **Lead** → Initial contact, gather information
2. **Qualified** → Confirm budget and need
3. **Proposal** → Present solution and pricing
4. **Closed** → Win the deal, onboard customer

### Metrics to Watch
- **Active Leads**: Are you generating enough prospects?
- **Conversion Rate**: Are you closing effectively?
- **Monthly Sales**: Are you hitting revenue targets?
- **Pipeline Value**: What's your potential revenue?

## Notes
- Leads are automatically set to "active" status
- First order converts lead to customer
- Premium status can be assigned to high-value customers
- Email addresses must be unique
- All customer data is searchable and filterable
