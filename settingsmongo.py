import os
import uuid
from datetime import datetime, timezone
from pymongo import MongoClient


def utc_now():
    return datetime.now(timezone.utc)


def new_uuid():
    return str(uuid.uuid4())


def seed_database(db):
    # Collection names map 1:1 to ER diagram table names
    role_col = db["ROLE"]
    user_col = db["USER"]
    user_role_col = db["USER_ROLE"]
    settings_col = db["SETTINGS"]
    quick_action_col = db["QUICK_ACTION"]
    activity_log_col = db["ACTIVITY_LOG"]
    metric_snapshot_col = db["METRIC_SNAPSHOT"]

    # Optional clean slate (idempotent-ish)
    role_col.delete_many({})
    user_col.delete_many({})
    user_role_col.delete_many({})
    settings_col.delete_many({})
    quick_action_col.delete_many({})
    activity_log_col.delete_many({})
    metric_snapshot_col.delete_many({})

    # ROLE
    roles = [
        {
            "id": new_uuid(),
            "code": "ADMIN",
            "name": "Administrator",
            "description": "Full administrative access",
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "code": "MANAGER",
            "name": "Manager",
            "description": "Manages teams and views analytics",
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "code": "VIEWER",
            "name": "Viewer",
            "description": "Read-only access",
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        },
    ]
    role_col.insert_many(roles)
    role_by_code = {r["code"]: r for r in roles}

    # USER
    user_admin_id = new_uuid()
    user_manager_id = new_uuid()
    users = [
        {
            "id": user_admin_id,
            "email": "admin@example.com",
            "displayName": "Alex Admin",
            "avatarUrl": "https://example.com/avatars/admin.png",
            "isActive": True,
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        },
        {
            "id": user_manager_id,
            "email": "manager@example.com",
            "displayName": "Morgan Manager",
            "avatarUrl": "https://example.com/avatars/manager.png",
            "isActive": True,
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        },
    ]
    user_col.insert_many(users)

    # USER_ROLE (assignments)
    user_roles = [
        {
            "id": new_uuid(),
            "userId": user_admin_id,
            "roleId": role_by_code["ADMIN"]["id"],
            "assignedAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "userId": user_manager_id,
            "roleId": role_by_code["MANAGER"]["id"],
            "assignedAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "userId": user_manager_id,
            "roleId": role_by_code["VIEWER"]["id"],
            "assignedAt": utc_now(),
        },
    ]
    user_role_col.insert_many(user_roles)

    # SETTINGS (1:1 per user)
    settings = [
        {
            "id": new_uuid(),
            "userId": user_admin_id,
            "theme": "dark",
            "locale": "en-US",
            "updatedAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "userId": user_manager_id,
            "theme": "light",
            "locale": "en-GB",
            "updatedAt": utc_now(),
        },
    ]
    settings_col.insert_many(settings)

    # QUICK_ACTION
    quick_actions = [
        {
            "id": new_uuid(),
            "code": "CREATE_INVOICE",
            "label": "Create Invoice",
            "route": "/finance/invoices/new",
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "code": "ADD_CONTACT",
            "label": "Add Contact",
            "route": "/crm/contacts/new",
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "code": "REVIEW_ALERTS",
            "label": "Review Alerts",
            "route": "/dashboard/alerts",
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        },
    ]
    quick_action_col.insert_many(quick_actions)
    qa_by_code = {q["code"]: q for q in quick_actions}

    # ACTIVITY_LOG
    activity_logs = [
        {
            "id": new_uuid(),
            "actorUserId": user_admin_id,
            "action": "LOGIN",
            "entityType": "USER",
            "entityId": user_admin_id,
            "createdAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "actorUserId": user_manager_id,
            "action": "CREATE",
            "entityType": "INVOICE",
            "entityId": new_uuid(),
            "createdAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "actorUserId": user_manager_id,
            "action": "CREATE",
            "entityType": "CONTACT",
            "entityId": new_uuid(),
            "createdAt": utc_now(),
        },
    ]
    # Optionally annotate which quick action triggered the event
    activity_logs[1]["quickActionId"] = qa_by_code["CREATE_INVOICE"]["id"]
    activity_logs[2]["quickActionId"] = qa_by_code["ADD_CONTACT"]["id"]

    activity_log_col.insert_many(activity_logs)

    # METRIC_SNAPSHOT
    metric_snapshots = [
        {
            "id": new_uuid(),
            "metricCode": "MRR",
            "asOf": utc_now(),
            "value": 125000.75,
            "unit": "USD",
            "createdAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "metricCode": "ACTIVE_USERS",
            "asOf": utc_now(),
            "value": 482,
            "unit": "count",
            "createdAt": utc_now(),
        },
        {
            "id": new_uuid(),
            "metricCode": "INVENTORY_STOCKOUTS",
            "asOf": utc_now(),
            "value": 3,
            "unit": "count",
            "createdAt": utc_now(),
        },
    ]
    metric_snapshot_col.insert_many(metric_snapshots)


def main():
    # Use your Compass connection string in MONGODB_URI if needed
    mongo_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    # Per request: single database named exactly "Settings,dashboard"
    db_name = "Settings,dashboard"

    client = MongoClient(mongo_uri)
    db = client[db_name]

    seed_database(db)
    print(f"Seeded database '{db_name}' with collections ROLE, USER, USER_ROLE, SETTINGS, QUICK_ACTION, ACTIVITY_LOG, METRIC_SNAPSHOT")


if __name__ == "__main__":
    main()