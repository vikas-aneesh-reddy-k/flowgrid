// Script to update user role to admin
// Run with: node server/scripts/update-user-role.js <email> <role>

import mongoose from 'mongoose';
import { User } from '../dist/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const updateUserRole = async (email, newRole) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:FlowGrid2024SecurePassword!@localhost:27017/flowgrid?authSource=admin';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`\nCurrent user details:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Current Role: ${user.role}`);
    console.log(`  Status: ${user.status}`);

    user.role = newRole;
    await user.save();

    console.log(`\n✅ User role updated successfully!`);
    console.log(`  New Role: ${user.role}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get command line arguments
const email = process.argv[2];
const role = process.argv[3] || 'admin';

const validRoles = ['admin', 'sales_manager', 'sales_rep', 'inventory_manager', 'accountant', 'hr_manager'];

if (!email) {
  console.error('Usage: node update-user-role.js <email> [role]');
  console.error('Valid roles:', validRoles.join(', '));
  process.exit(1);
}

if (!validRoles.includes(role)) {
  console.error(`Invalid role: ${role}`);
  console.error('Valid roles:', validRoles.join(', '));
  process.exit(1);
}

console.log(`\nUpdating user role...`);
console.log(`  Email: ${email}`);
console.log(`  New Role: ${role}\n`);

updateUserRole(email, role);
