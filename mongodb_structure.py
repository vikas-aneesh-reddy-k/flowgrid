from pymongo import MongoClient
from datetime import datetime

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["flowgrid"]

def create_collections():
    """Create MongoDB collections with structural definitions"""
    
    # 1. USERS collection structure
    users_structure = {
        "email": "string",
        "name": "string",
        "role": "string",
        "employee": {
            "department": "string",
            "position": "string", 
            "hireDate": "datetime",
            "salary": "number"
        }
    }
    
    # 2. CUSTOMERS collection structure
    customers_structure = {
        "name": "string",
        "email": "string",
        "phone": "string",
        "status": "string",
        "company": "string",
        "address": {
            "street": "string",
            "city": "string",
            "state": "string",
            "zipCode": "string"
        },
        "createdAt": "datetime",
        "totalOrders": "number",
        "totalValue": "number"
    }
    
    # 3. PRODUCTS collection structure
    products_structure = {
        "sku": "string (Primary Key)",
        "name": "string",
        "price": "number",
        "stock": "number",
        "category": "string",
        "description": "string",
        "status": "string",
        "createdAt": "datetime",
        "updatedAt": "datetime"
    }
    
    # 4. EMPLOYEES collection structure (Employee + Payroll/HR combined)
    employees_structure = {
        "employeeId": "string",
        "userId": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "department": "string",
        "position": "string",
        "hireDate": "datetime",
        "baseSalary": "number",
        "status": "string",
        "address": {
            "street": "string",
            "city": "string",
            "state": "string",
            "pincode": "string"
        },
        "payroll": [
            {
                "payrollId": "string",
                "payPeriodStart": "datetime",
                "payPeriodEnd": "datetime",
                "baseSalary": "number",
                "overtimePay": "number",
                "bonuses": "number",
                "grossPay": "number",
                "taxDeduction": "number",
                "insuranceDeduction": "number",
                "netPay": "number",
                "status": "string",
                "payDate": "datetime"
            }
        ],
        "leaveRequests": [
            {
                "leaveId": "string",
                "type": "string",
                "startDate": "datetime",
                "endDate": "datetime",
                "days": "number",
                "status": "string",
                "reason": "string",
                "appliedDate": "datetime"
            }
        ]
    }
    
    # 5. ORDERS collection structure (Order + Order_Item + Invoice combined)
    orders_structure = {
        "orderId": "string ",
        "customerId": "string ",
        "customerEmail": "string",
        "status": "string",
        "orderDate": "datetime",
        "total": "number",
        "shippingAddress": {
            "street": "string",
            "city": "string",
            "state": "string",
            "zipCode": "string"
        },
        "orderItems": [
            {
                "productSku": "string",
                "productName": "string",
                "quantity": "number",
                "unitPrice": "number",
                "lineTotal": "number"
            }
        ],
        "invoice": {
            "invoiceNumber": "string",
            "amount": "number",
            "status": "string",
            "dueDate": "datetime",
            "paidDate": "datetime",
            "paymentMethod": "string"
        }
    }
    
    # Create collections (empty)
    collections = {
        "users": users_structure,
        "customers": customers_structure,
        "products": products_structure,
        "employees": employees_structure,
        "orders": orders_structure
    }
    
    print("📋 MongoDB Collections Structure Created:")
    print("=" * 50)
    
    for collection_name, structure in collections.items():
        print(f"\n🔹 {collection_name.upper()}")
        print(f"   Fields: {len(structure)} main fields")
        if "payroll" in structure:
            print(f"   Nested: payroll array, leaveRequests array")
        if "orderItems" in structure:
            print(f"   Nested: orderItems array, invoice object")
        if "address" in structure:
            print(f"   Nested: address object")
    
    print(f"\n✅ 5 collections structure defined successfully!")
    return collections

if __name__ == "__main__":
    create_collections()
