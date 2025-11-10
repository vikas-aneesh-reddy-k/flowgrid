from pymongo import MongoClient
from datetime import datetime, timedelta
import random

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["flowgrid"]

def setup_collections():
    """Create and populate MongoDB collections based on ER diagram"""
    
    # Drop existing collections if they exist
    collections_to_drop = ["users", "customers", "orders", "products", "employees"]
    for collection_name in collections_to_drop:
        if collection_name in db.list_collection_names():
            db.drop_collection(collection_name)
            print(f"Dropped existing collection: {collection_name}")
    
    # 1. USERS collection (User + Employee combined)
    users_data = [
        {
            "email": "admin@gmail.com",
            "name": "Admin User",
            "role": "admin",
            "employee": {
                "department": "IT",
                "position": "System Administrator",
                "hireDate": datetime(2020, 1, 15),
                "salary": 75000
            }
        },
        {
            "email": "john.smith@company.com",
            "name": "John Smith",
            "role": "sales_manager",
            "employee": {
                "department": "Sales",
                "position": "Sales Manager",
                "hireDate": datetime(2021, 3, 10),
                "salary": 65000
            }
        },
        {
            "email": "sarah.johnson@company.com",
            "name": "Sarah Johnson",
            "role": "sales_rep",
            "employee": {
                "department": "Sales",
                "position": "Sales Representative",
                "hireDate": datetime(2022, 6, 1),
                "salary": 45000
            }
        },
        {
            "email": "mike.chen@company.com",
            "name": "Mike Chen",
            "role": "inventory_manager",
            "employee": {
                "department": "Operations",
                "position": "Inventory Manager",
                "hireDate": datetime(2021, 9, 15),
                "salary": 55000
            }
        },
        {
            "email": "lisa.wang@company.com",
            "name": "Lisa Wang",
            "role": "accountant",
            "employee": {
                "department": "Finance",
                "position": "Senior Accountant",
                "hireDate": datetime(2020, 11, 20),
                "salary": 60000
            }
        }
    ]
    
    # 2. CUSTOMERS collection
    customers_data = [
        {
            "name": "Acme Corporation",
            "email": "contact@acme.com",
            "phone": "+1-555-0101",
            "status": "active",
            "company": "Acme Corporation",
            "address": {
                "street": "123 Business Ave",
                "city": "New York",
                "state": "NY",
                "zipCode": "10001"
            },
            "createdAt": datetime(2023, 1, 15),
            "totalOrders": 15,
            "totalValue": 125000
        },
        {
            "name": "TechStart Inc.",
            "email": "info@techstart.com",
            "phone": "+1-555-0102",
            "status": "active",
            "company": "TechStart Inc.",
            "address": {
                "street": "456 Innovation Blvd",
                "city": "San Francisco",
                "state": "CA",
                "zipCode": "94105"
            },
            "createdAt": datetime(2023, 3, 10),
            "totalOrders": 8,
            "totalValue": 75000
        },
        {
            "name": "Global Solutions Ltd.",
            "email": "sales@global.com",
            "phone": "+1-555-0103",
            "status": "premium",
            "company": "Global Solutions Ltd.",
            "address": {
                "street": "789 Corporate Dr",
                "city": "Chicago",
                "state": "IL",
                "zipCode": "60601"
            },
            "createdAt": datetime(2022, 8, 20),
            "totalOrders": 25,
            "totalValue": 300000
        },
        {
            "name": "Innovation Labs",
            "email": "hello@innovation.com",
            "phone": "+1-555-0104",
            "status": "active",
            "company": "Innovation Labs",
            "address": {
                "street": "321 Startup St",
                "city": "Austin",
                "state": "TX",
                "zipCode": "73301"
            },
            "createdAt": datetime(2023, 6, 5),
            "totalOrders": 5,
            "totalValue": 45000
        },
        {
            "name": "Digital Dynamics",
            "email": "contact@digital.com",
            "phone": "+1-555-0105",
            "status": "active",
            "company": "Digital Dynamics",
            "address": {
                "street": "654 Tech Park",
                "city": "Seattle",
                "state": "WA",
                "zipCode": "98101"
            },
            "createdAt": datetime(2023, 2, 28),
            "totalOrders": 12,
            "totalValue": 95000
        }
    ]
    
    # 3. PRODUCTS collection
    products_data = [
        {
            "sku": "LAPTOP-001",
            "name": "Laptop Pro 15",
            "price": 1299.99,
            "stock": 45,
            "category": "Electronics",
            "description": "High-performance laptop for professionals",
            "status": "active",
            "createdAt": datetime(2023, 1, 1),
            "updatedAt": datetime.now()
        },
        {
            "sku": "MOUSE-002",
            "name": "Wireless Mouse",
            "price": 29.99,
            "stock": 12,
            "category": "Accessories",
            "description": "Ergonomic wireless mouse",
            "status": "active",
            "createdAt": datetime(2023, 1, 1),
            "updatedAt": datetime.now()
        },
        {
            "sku": "CABLE-003",
            "name": "USB-C Cable",
            "price": 19.99,
            "stock": 0,
            "category": "Accessories",
            "description": "High-speed USB-C charging cable",
            "status": "out_of_stock",
            "createdAt": datetime(2023, 1, 1),
            "updatedAt": datetime.now()
        },
        {
            "sku": "KEYBOARD-004",
            "name": "Mechanical Keyboard",
            "price": 149.99,
            "stock": 78,
            "category": "Accessories",
            "description": "RGB mechanical gaming keyboard",
            "status": "active",
            "createdAt": datetime(2023, 1, 1),
            "updatedAt": datetime.now()
        },
        {
            "sku": "MONITOR-005",
            "name": "Monitor 27\"",
            "price": 399.99,
            "stock": 8,
            "category": "Electronics",
            "description": "4K Ultra HD monitor",
            "status": "low_stock",
            "createdAt": datetime(2023, 1, 1),
            "updatedAt": datetime.now()
        },
        {
            "sku": "TABLET-006",
            "name": "Tablet Pro 12",
            "price": 799.99,
            "stock": 25,
            "category": "Electronics",
            "description": "Professional tablet with stylus",
            "status": "active",
            "createdAt": datetime(2023, 1, 1),
            "updatedAt": datetime.now()
        },
        {
            "sku": "HEADPHONE-007",
            "name": "Noise Cancelling Headphones",
            "price": 199.99,
            "stock": 35,
            "category": "Accessories",
            "description": "Premium noise cancelling headphones",
            "status": "active",
            "createdAt": datetime(2023, 1, 1),
            "updatedAt": datetime.now()
        },
        {
            "sku": "WEBCAM-008",
            "name": "HD Webcam",
            "price": 89.99,
            "stock": 20,
            "category": "Accessories",
            "description": "1080p HD webcam for video calls",
            "status": "active",
            "createdAt": datetime(2023, 1, 1),
            "updatedAt": datetime.now()
        }
    ]
    
    # 4. EMPLOYEES collection (Employee + Payroll/HR combined)
    employees_data = [
        {
            "employeeId": "EMP-001",
            "userId": "user_001",
            "name": "Rajesh Kumar",
            "email": "rajesh.kumar@company.com",
            "phone": "+91-98765-43210",
            "department": "Engineering",
            "position": "Senior Software Engineer",
            "hireDate": datetime(2022, 3, 15),
            "baseSalary": 850000,  # Annual salary in INR
            "status": "active",
            "address": {
                "street": "123 MG Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            },
            "payroll": [
                {
                    "payrollId": "PAY-2024-001",
                    "payPeriodStart": datetime(2024, 1, 1),
                    "payPeriodEnd": datetime(2024, 1, 31),
                    "baseSalary": 70833,  # Monthly base salary
                    "overtimePay": 5000,
                    "bonuses": 10000,
                    "grossPay": 85833,
                    "taxDeduction": 12875,
                    "insuranceDeduction": 2000,
                    "netPay": 70958,
                    "status": "paid",
                    "payDate": datetime(2024, 2, 5)
                },
                {
                    "payrollId": "PAY-2024-002",
                    "payPeriodStart": datetime(2024, 2, 1),
                    "payPeriodEnd": datetime(2024, 2, 29),
                    "baseSalary": 70833,
                    "overtimePay": 7500,
                    "bonuses": 0,
                    "grossPay": 78333,
                    "taxDeduction": 11750,
                    "insuranceDeduction": 2000,
                    "netPay": 64583,
                    "status": "paid",
                    "payDate": datetime(2024, 3, 5)
                }
            ],
            "leaveRequests": [
                {
                    "leaveId": "LEAVE-001",
                    "type": "Annual Leave",
                    "startDate": datetime(2024, 6, 15),
                    "endDate": datetime(2024, 6, 20),
                    "days": 5,
                    "status": "approved",
                    "reason": "Family vacation",
                    "appliedDate": datetime(2024, 5, 1)
                }
            ]
        },
        {
            "employeeId": "EMP-002",
            "userId": "user_002",
            "name": "Priya Sharma",
            "email": "priya.sharma@company.com",
            "phone": "+91-98765-43211",
            "department": "Sales",
            "position": "Sales Manager",
            "hireDate": datetime(2021, 8, 10),
            "baseSalary": 1200000,  # Annual salary in INR
            "status": "active",
            "address": {
                "street": "456 Park Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            },
            "payroll": [
                {
                    "payrollId": "PAY-2024-003",
                    "payPeriodStart": datetime(2024, 1, 1),
                    "payPeriodEnd": datetime(2024, 1, 31),
                    "baseSalary": 100000,
                    "overtimePay": 0,
                    "bonuses": 25000,
                    "grossPay": 125000,
                    "taxDeduction": 18750,
                    "insuranceDeduction": 3000,
                    "netPay": 103250,
                    "status": "paid",
                    "payDate": datetime(2024, 2, 5)
                },
                {
                    "payrollId": "PAY-2024-004",
                    "payPeriodStart": datetime(2024, 2, 1),
                    "payPeriodEnd": datetime(2024, 2, 29),
                    "baseSalary": 100000,
                    "overtimePay": 0,
                    "bonuses": 15000,
                    "grossPay": 115000,
                    "taxDeduction": 17250,
                    "insuranceDeduction": 3000,
                    "netPay": 94750,
                    "status": "paid",
                    "payDate": datetime(2024, 3, 5)
                }
            ],
            "leaveRequests": [
                {
                    "leaveId": "LEAVE-002",
                    "type": "Sick Leave",
                    "startDate": datetime(2024, 3, 10),
                    "endDate": datetime(2024, 3, 12),
                    "days": 2,
                    "status": "approved",
                    "reason": "Medical emergency",
                    "appliedDate": datetime(2024, 3, 9)
                }
            ]
        },
        {
            "employeeId": "EMP-003",
            "userId": "user_003",
            "name": "Amit Patel",
            "email": "amit.patel@company.com",
            "phone": "+91-98765-43212",
            "department": "Marketing",
            "position": "Marketing Specialist",
            "hireDate": datetime(2023, 1, 20),
            "baseSalary": 600000,  # Annual salary in INR
            "status": "active",
            "address": {
                "street": "789 Sector 17",
                "city": "Chandigarh",
                "state": "Punjab",
                "pincode": "160017"
            },
            "payroll": [
                {
                    "payrollId": "PAY-2024-005",
                    "payPeriodStart": datetime(2024, 1, 1),
                    "payPeriodEnd": datetime(2024, 1, 31),
                    "baseSalary": 50000,
                    "overtimePay": 2000,
                    "bonuses": 5000,
                    "grossPay": 57000,
                    "taxDeduction": 8550,
                    "insuranceDeduction": 1500,
                    "netPay": 46950,
                    "status": "paid",
                    "payDate": datetime(2024, 2, 5)
                }
            ],
            "leaveRequests": []
        },
        {
            "employeeId": "EMP-004",
            "userId": "user_004",
            "name": "Sneha Reddy",
            "email": "sneha.reddy@company.com",
            "phone": "+91-98765-43213",
            "department": "Operations",
            "position": "Operations Manager",
            "hireDate": datetime(2020, 5, 12),
            "baseSalary": 900000,  # Annual salary in INR
            "status": "active",
            "address": {
                "street": "321 Brigade Road",
                "city": "Hyderabad",
                "state": "Telangana",
                "pincode": "500001"
            },
            "payroll": [
                {
                    "payrollId": "PAY-2024-006",
                    "payPeriodStart": datetime(2024, 1, 1),
                    "payPeriodEnd": datetime(2024, 1, 31),
                    "baseSalary": 75000,
                    "overtimePay": 3000,
                    "bonuses": 8000,
                    "grossPay": 86000,
                    "taxDeduction": 12900,
                    "insuranceDeduction": 2500,
                    "netPay": 70600,
                    "status": "paid",
                    "payDate": datetime(2024, 2, 5)
                }
            ],
            "leaveRequests": [
                {
                    "leaveId": "LEAVE-003",
                    "type": "Maternity Leave",
                    "startDate": datetime(2024, 4, 1),
                    "endDate": datetime(2024, 7, 31),
                    "days": 90,
                    "status": "approved",
                    "reason": "Maternity leave",
                    "appliedDate": datetime(2024, 3, 15)
                }
            ]
        },
        {
            "employeeId": "EMP-005",
            "userId": "user_005",
            "name": "Vikram Singh",
            "email": "vikram.singh@company.com",
            "phone": "+91-98765-43214",
            "department": "Finance",
            "position": "Senior Accountant",
            "hireDate": datetime(2021, 11, 8),
            "baseSalary": 750000,  # Annual salary in INR
            "status": "active",
            "address": {
                "street": "654 Connaught Place",
                "city": "New Delhi",
                "state": "Delhi",
                "pincode": "110001"
            },
            "payroll": [
                {
                    "payrollId": "PAY-2024-007",
                    "payPeriodStart": datetime(2024, 1, 1),
                    "payPeriodEnd": datetime(2024, 1, 31),
                    "baseSalary": 62500,
                    "overtimePay": 0,
                    "bonuses": 12000,
                    "grossPay": 74500,
                    "taxDeduction": 11175,
                    "insuranceDeduction": 2000,
                    "netPay": 61325,
                    "status": "paid",
                    "payDate": datetime(2024, 2, 5)
                }
            ],
            "leaveRequests": [
                {
                    "leaveId": "LEAVE-004",
                    "type": "Personal Leave",
                    "startDate": datetime(2024, 5, 20),
                    "endDate": datetime(2024, 5, 22),
                    "days": 2,
                    "status": "pending",
                    "reason": "Personal work",
                    "appliedDate": datetime(2024, 5, 18)
                }
            ]
        }
    ]

    # 5. ORDERS collection (Order + Order_Item + Invoice combined)
    orders_data = [
        {
            "orderId": "ORD-2024-001",
            "customerId": "Acme Corporation",
            "customerEmail": "contact@acme.com",
            "status": "completed",
            "orderDate": datetime(2024, 1, 15),
            "total": 2849.97,
            "shippingAddress": {
                "street": "123 Business Ave",
                "city": "New York",
                "state": "NY",
                "zipCode": "10001"
            },
            "orderItems": [
                {
                    "productSku": "LAPTOP-001",
                    "productName": "Laptop Pro 15",
                    "quantity": 2,
                    "unitPrice": 1299.99,
                    "lineTotal": 2599.98
                },
                {
                    "productSku": "MOUSE-002",
                    "productName": "Wireless Mouse",
                    "quantity": 2,
                    "unitPrice": 29.99,
                    "lineTotal": 59.98
                },
                {
                    "productSku": "KEYBOARD-004",
                    "productName": "Mechanical Keyboard",
                    "quantity": 2,
                    "unitPrice": 149.99,
                    "lineTotal": 299.98
                }
            ],
            "invoice": {
                "invoiceNumber": "INV-2024-001",
                "amount": 2849.97,
                "status": "paid",
                "dueDate": datetime(2024, 2, 15),
                "paidDate": datetime(2024, 1, 20),
                "paymentMethod": "Credit Card"
            }
        },
        {
            "orderId": "ORD-2024-002",
            "customerId": "TechStart Inc.",
            "customerEmail": "info@techstart.com",
            "status": "processing",
            "orderDate": datetime(2024, 1, 20),
            "total": 1229.97,
            "shippingAddress": {
                "street": "456 Innovation Blvd",
                "city": "San Francisco",
                "state": "CA",
                "zipCode": "94105"
            },
            "orderItems": [
                {
                    "productSku": "TABLET-006",
                    "productName": "Tablet Pro 12",
                    "quantity": 1,
                    "unitPrice": 799.99,
                    "lineTotal": 799.99
                },
                {
                    "productSku": "HEADPHONE-007",
                    "productName": "Noise Cancelling Headphones",
                    "quantity": 1,
                    "unitPrice": 199.99,
                    "lineTotal": 199.99
                },
                {
                    "productSku": "WEBCAM-008",
                    "productName": "HD Webcam",
                    "quantity": 1,
                    "unitPrice": 89.99,
                    "lineTotal": 89.99
                }
            ],
            "invoice": {
                "invoiceNumber": "INV-2024-002",
                "amount": 1229.97,
                "status": "pending",
                "dueDate": datetime(2024, 2, 20),
                "paidDate": None,
                "paymentMethod": None
            }
        },
        {
            "orderId": "ORD-2024-003",
            "customerId": "Global Solutions Ltd.",
            "customerEmail": "sales@global.com",
            "status": "shipped",
            "orderDate": datetime(2024, 1, 25),
            "total": 1599.97,
            "shippingAddress": {
                "street": "789 Corporate Dr",
                "city": "Chicago",
                "state": "IL",
                "zipCode": "60601"
            },
            "orderItems": [
                {
                    "productSku": "MONITOR-005",
                    "productName": "Monitor 27\"",
                    "quantity": 4,
                    "unitPrice": 399.99,
                    "lineTotal": 1599.96
                }
            ],
            "invoice": {
                "invoiceNumber": "INV-2024-003",
                "amount": 1599.97,
                "status": "paid",
                "dueDate": datetime(2024, 2, 25),
                "paidDate": datetime(2024, 1, 28),
                "paymentMethod": "Bank Transfer"
            }
        },
        {
            "orderId": "ORD-2024-004",
            "customerId": "Innovation Labs",
            "customerEmail": "hello@innovation.com",
            "status": "pending",
            "orderDate": datetime(2024, 1, 30),
            "total": 249.98,
            "shippingAddress": {
                "street": "321 Startup St",
                "city": "Austin",
                "state": "TX",
                "zipCode": "73301"
            },
            "orderItems": [
                {
                    "productSku": "KEYBOARD-004",
                    "productName": "Mechanical Keyboard",
                    "quantity": 1,
                    "unitPrice": 149.99,
                    "lineTotal": 149.99
                },
                {
                    "productSku": "MOUSE-002",
                    "productName": "Wireless Mouse",
                    "quantity": 2,
                    "unitPrice": 29.99,
                    "lineTotal": 59.98
                },
                {
                    "productSku": "HEADPHONE-007",
                    "productName": "Noise Cancelling Headphones",
                    "quantity": 1,
                    "unitPrice": 199.99,
                    "lineTotal": 199.99
                }
            ],
            "invoice": {
                "invoiceNumber": "INV-2024-004",
                "amount": 249.98,
                "status": "pending",
                "dueDate": datetime(2024, 3, 1),
                "paidDate": None,
                "paymentMethod": None
            }
        },
        {
            "orderId": "ORD-2024-005",
            "customerId": "Digital Dynamics",
            "customerEmail": "contact@digital.com",
            "status": "completed",
            "orderDate": datetime(2024, 2, 5),
            "total": 1049.97,
            "shippingAddress": {
                "street": "654 Tech Park",
                "city": "Seattle",
                "state": "WA",
                "zipCode": "98101"
            },
            "orderItems": [
                {
                    "productSku": "LAPTOP-001",
                    "productName": "Laptop Pro 15",
                    "quantity": 1,
                    "unitPrice": 1299.99,
                    "lineTotal": 1299.99
                }
            ],
            "invoice": {
                "invoiceNumber": "INV-2024-005",
                "amount": 1049.97,
                "status": "paid",
                "dueDate": datetime(2024, 3, 5),
                "paidDate": datetime(2024, 2, 10),
                "paymentMethod": "Credit Card"
            }
        }
    ]
    
    # Insert data into collections
    print("Creating collections and inserting sample data...")
    
    # Insert users
    users_collection = db["users"]
    users_result = users_collection.insert_many(users_data)
    print(f"Inserted {len(users_result.inserted_ids)} users")
    
    # Insert customers
    customers_collection = db["customers"]
    customers_result = customers_collection.insert_many(customers_data)
    print(f"Inserted {len(customers_result.inserted_ids)} customers")
    
    # Insert products
    products_collection = db["products"]
    products_result = products_collection.insert_many(products_data)
    print(f"Inserted {len(products_result.inserted_ids)} products")
    
    # Insert employees (Employee + Payroll/HR combined)
    employees_collection = db["employees"]
    employees_result = employees_collection.insert_many(employees_data)
    print(f"Inserted {len(employees_result.inserted_ids)} employees")
    
    # Insert orders
    orders_collection = db["orders"]
    orders_result = orders_collection.insert_many(orders_data)
    print(f"Inserted {len(orders_result.inserted_ids)} orders")
    
    print("\nAll collections created successfully!")
    print("\nCollections created:")
    print("1. users (User + Employee combined)")
    print("2. customers")
    print("3. products")
    print("4. employees (Employee + Payroll/HR combined)")
    print("5. orders (Order + Order_Item + Invoice combined)")
    
    return True

def verify_collections():
    """Verify that collections were created with data"""
    print("\nCollection Statistics:")
    print("-" * 40)
    
    collections = ["users", "customers", "products", "employees", "orders"]
    for collection_name in collections:
        count = db[collection_name].count_documents({})
        print(f"{collection_name}: {count} documents")
    
    print("\nSample data preview:")
    print("-" * 40)
    
    # Show sample user
    sample_user = db["users"].find_one()
    print("Sample User:")
    print(f"  Name: {sample_user['name']}")
    print(f"  Email: {sample_user['email']}")
    print(f"  Department: {sample_user['employee']['department']}")
    
    # Show sample customer
    sample_customer = db["customers"].find_one()
    print(f"\nSample Customer:")
    print(f"  Name: {sample_customer['name']}")
    print(f"  Email: {sample_customer['email']}")
    print(f"  Status: {sample_customer['status']}")
    
    # Show sample product
    sample_product = db["products"].find_one()
    print(f"\nSample Product:")
    print(f"  SKU: {sample_product['sku']}")
    print(f"  Name: {sample_product['name']}")
    print(f"  Price: ${sample_product['price']}")
    print(f"  Stock: {sample_product['stock']}")
    
    # Show sample employee
    sample_employee = db["employees"].find_one()
    print(f"\nSample Employee:")
    print(f"  Name: {sample_employee['name']}")
    print(f"  Department: {sample_employee['department']}")
    print(f"  Position: {sample_employee['position']}")
    print(f"  Base Salary: ₹{sample_employee['baseSalary']:,}")
    print(f"  Payroll Records: {len(sample_employee['payroll'])}")
    print(f"  Leave Requests: {len(sample_employee['leaveRequests'])}")
    
    # Show sample order
    sample_order = db["orders"].find_one()
    print(f"\nSample Order:")
    print(f"  Order ID: {sample_order['orderId']}")
    print(f"  Customer: {sample_order['customerId']}")
    print(f"  Total: ${sample_order['total']}")
    print(f"  Items: {len(sample_order['orderItems'])}")
    print(f"  Invoice Status: {sample_order['invoice']['status']}")

if __name__ == "__main__":
    try:
        print("Setting up MongoDB collections for FlowGrid database...")
        print("=" * 60)
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB successfully!")
        
        # Setup collections
        setup_collections()
        
        # Verify collections
        verify_collections()
        
        print("\n Setup completed successfully!")
        print("You can now view the collections in MongoDB Compass.")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure MongoDB is running on localhost:27017")
    
    finally:
        client.close()
