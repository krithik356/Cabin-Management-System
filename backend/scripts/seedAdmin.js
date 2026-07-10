const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('../models/Admin');

/**
 * Seed script to create a single admin account
 * Default credentials:
 * Email: admin@cabins.com
 * Password: admin123
 */

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI or MONGO_URI is not defined in .env file');
  process.exit(1);
}

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@cabins.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log('   Email: admin@cabins.com');
      console.log('   To reset password, delete the admin from database first.');
      process.exit(0);
    }

    // Create admin
    const admin = await Admin.create({
      email: 'admin@cabins.com',
      password: 'admin123',
    });

    console.log('\n✅ Admin account created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('====================');
    console.log('Email:    admin@cabins.com');
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();

