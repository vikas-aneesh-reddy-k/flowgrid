# Seed Companies into MongoDB

## Method 1: Using MongoDB Compass (EASIEST)

### Step 1: Connect to EC2 MongoDB
1. Open MongoDB Compass
2. Create new connection with this connection string:
   ```
   mongodb://admin:FlowGrid2024SecurePassword!@13.51.176.153:27017/flowgrid?authSource=admin
   ```
3. Click "Connect"

### Step 2: Import Companies
1. In the left sidebar, expand the `flowgrid` database
2. Click on the `customers` collection
3. Click the "ADD DATA" button (top right)
4. Select "Import JSON or CSV file"
5. Browse and select the `seed-companies.json` file from this project
6. Click "Import"

### Step 3: Verify
1. You should see 8 companies in the `customers` collection
2. Refresh your signup page - companies should now appear in the dropdown!

---

## Method 2: Using MongoDB Shell on EC2

SSH into EC2 and run:

```bash
ssh -i flowgrid.pem ubuntu@13.51.176.153

# Connect to MongoDB
docker exec -it flowgrid-mongodb-1 mongosh -u admin -p FlowGrid2024SecurePassword! --authenticationDatabase admin flowgrid

# Paste this command to insert companies:
db.customers.insertMany([
  {
    name: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+1-555-0123",
    status: "active",
    company: "Acme Corporation",
    segment: "Enterprise",
    address: {
      street: "123 Business St",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    },
    totalOrders: 0,
    totalValue: 0,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    name: "TechStart Inc.",
    email: "hello@techstart.com",
    phone: "+1-555-0124",
    status: "active",
    company: "TechStart Inc.",
    segment: "SMB",
    address: {
      street: "456 Tech Ave",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102"
    },
    totalOrders: 0,
    totalValue: 0,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20")
  },
  {
    name: "Global Solutions Ltd.",
    email: "contact@global.com",
    phone: "+1-555-0125",
    status: "premium",
    company: "Global Solutions Ltd.",
    segment: "Enterprise",
    address: {
      street: "789 Global Blvd",
      city: "Chicago",
      state: "IL",
      zipCode: "60601"
    },
    totalOrders: 0,
    totalValue: 0,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10")
  },
  {
    name: "Innovation Labs",
    email: "hello@innovation.com",
    phone: "+1-555-0126",
    status: "active",
    company: "Innovation Labs",
    segment: "Startup",
    address: {
      street: "321 Innovation Way",
      city: "Austin",
      state: "TX",
      zipCode: "73301"
    },
    totalOrders: 0,
    totalValue: 0,
    createdAt: new Date("2024-04-05"),
    updatedAt: new Date("2024-04-05")
  },
  {
    name: "Digital Dynamics",
    email: "info@digitaldynamics.com",
    phone: "+1-555-0127",
    status: "active",
    company: "Digital Dynamics",
    segment: "Enterprise",
    address: {
      street: "555 Digital Dr",
      city: "Seattle",
      state: "WA",
      zipCode: "98101"
    },
    totalOrders: 0,
    totalValue: 0,
    createdAt: new Date("2024-05-12"),
    updatedAt: new Date("2024-05-12")
  },
  {
    name: "CloudTech Systems",
    email: "support@cloudtech.com",
    phone: "+1-555-0128",
    status: "active",
    company: "CloudTech Systems",
    segment: "SMB",
    address: {
      street: "888 Cloud Lane",
      city: "Denver",
      state: "CO",
      zipCode: "80201"
    },
    totalOrders: 0,
    totalValue: 0,
    createdAt: new Date("2024-06-18"),
    updatedAt: new Date("2024-06-18")
  },
  {
    name: "DataFlow Analytics",
    email: "contact@dataflow.com",
    phone: "+1-555-0129",
    status: "premium",
    company: "DataFlow Analytics",
    segment: "Enterprise",
    address: {
      street: "999 Analytics Blvd",
      city: "Boston",
      state: "MA",
      zipCode: "02101"
    },
    totalOrders: 0,
    totalValue: 0,
    createdAt: new Date("2024-07-22"),
    updatedAt: new Date("2024-07-22")
  },
  {
    name: "NextGen Enterprises",
    email: "info@nextgen.com",
    phone: "+1-555-0130",
    status: "active",
    company: "NextGen Enterprises",
    segment: "Startup",
    address: {
      street: "111 Future St",
      city: "Miami",
      state: "FL",
      zipCode: "33101"
    },
    totalOrders: 0,
    totalValue: 0,
    createdAt: new Date("2024-08-30"),
    updatedAt: new Date("2024-08-30")
  }
])

# Verify insertion
db.customers.countDocuments()

# Exit
exit
```

---

## Method 3: Quick Command (Copy-Paste)

```bash
ssh -i flowgrid.pem ubuntu@13.51.176.153 "docker exec -it flowgrid-mongodb-1 mongosh -u admin -p FlowGrid2024SecurePassword! --authenticationDatabase admin flowgrid --eval 'db.customers.insertMany([{name:\"Acme Corporation\",email:\"contact@acme.com\",phone:\"+1-555-0123\",status:\"active\",company:\"Acme Corporation\",segment:\"Enterprise\",address:{street:\"123 Business St\",city:\"New York\",state:\"NY\",zipCode:\"10001\"},totalOrders:0,totalValue:0,createdAt:new Date(\"2024-01-15\"),updatedAt:new Date(\"2024-01-15\")},{name:\"TechStart Inc.\",email:\"hello@techstart.com\",phone:\"+1-555-0124\",status:\"active\",company:\"TechStart Inc.\",segment:\"SMB\",address:{street:\"456 Tech Ave\",city:\"San Francisco\",state:\"CA\",zipCode:\"94102\"},totalOrders:0,totalValue:0,createdAt:new Date(\"2024-02-20\"),updatedAt:new Date(\"2024-02-20\")},{name:\"Global Solutions Ltd.\",email:\"contact@global.com\",phone:\"+1-555-0125\",status:\"premium\",company:\"Global Solutions Ltd.\",segment:\"Enterprise\",address:{street:\"789 Global Blvd\",city:\"Chicago\",state:\"IL\",zipCode:\"60601\"},totalOrders:0,totalValue:0,createdAt:new Date(\"2024-03-10\"),updatedAt:new Date(\"2024-03-10\")},{name:\"Innovation Labs\",email:\"hello@innovation.com\",phone:\"+1-555-0126\",status:\"active\",company:\"Innovation Labs\",segment:\"Startup\",address:{street:\"321 Innovation Way\",city:\"Austin\",state:\"TX\",zipCode:\"73301\"},totalOrders:0,totalValue:0,createdAt:new Date(\"2024-04-05\"),updatedAt:new Date(\"2024-04-05\")},{name:\"Digital Dynamics\",email:\"info@digitaldynamics.com\",phone:\"+1-555-0127\",status:\"active\",company:\"Digital Dynamics\",segment:\"Enterprise\",address:{street:\"555 Digital Dr\",city:\"Seattle\",state:\"WA\",zipCode:\"98101\"},totalOrders:0,totalValue:0,createdAt:new Date(\"2024-05-12\"),updatedAt:new Date(\"2024-05-12\")},{name:\"CloudTech Systems\",email:\"support@cloudtech.com\",phone:\"+1-555-0128\",status:\"active\",company:\"CloudTech Systems\",segment:\"SMB\",address:{street:\"888 Cloud Lane\",city:\"Denver\",state:\"CO\",zipCode:\"80201\"},totalOrders:0,totalValue:0,createdAt:new Date(\"2024-06-18\"),updatedAt:new Date(\"2024-06-18\")},{name:\"DataFlow Analytics\",email:\"contact@dataflow.com\",phone:\"+1-555-0129\",status:\"premium\",company:\"DataFlow Analytics\",segment:\"Enterprise\",address:{street:\"999 Analytics Blvd\",city:\"Boston\",state:\"MA\",zipCode:\"02101\"},totalOrders:0,totalValue:0,createdAt:new Date(\"2024-07-22\"),updatedAt:new Date(\"2024-07-22\")},{name:\"NextGen Enterprises\",email:\"info@nextgen.com\",phone:\"+1-555-0130\",status:\"active\",company:\"NextGen Enterprises\",segment:\"Startup\",address:{street:\"111 Future St\",city:\"Miami\",state:\"FL\",zipCode:\"33101\"},totalOrders:0,totalValue:0,createdAt:new Date(\"2024-08-30\"),updatedAt:new Date(\"2024-08-30\")}])'"
```

---

## Companies Added:

1. **Acme Corporation** - Enterprise
2. **TechStart Inc.** - SMB
3. **Global Solutions Ltd.** - Enterprise (Premium)
4. **Innovation Labs** - Startup
5. **Digital Dynamics** - Enterprise
6. **CloudTech Systems** - SMB
7. **DataFlow Analytics** - Enterprise (Premium)
8. **NextGen Enterprises** - Startup

After seeding, these companies will appear in the signup page dropdown!
