const mongoose = require('mongoose');
require('dotenv').config();
const Cabin = require('../models/Cabin');

/**
 * Seed script to populate database with initial cabins
 * 2 conference rooms and 18 work cabins (3-5 people each)
 */

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI or MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Cabin data to seed
const cabinsData = [
  // Conference Rooms (2)
  {
    name: 'Conference Room A',
    type: 'conference',
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Conference Room B',
    type: 'conference',
    status: 'available',
    isBooked: false,
  },
  // Work Cabins (18) - fitting 3-5 people each
  {
    name: 'Cabin 1',
    type: 'work',
    capacity: 3,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 2',
    type: 'work',
    capacity: 4,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 3',
    type: 'work',
    capacity: 5,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 4',
    type: 'work',
    capacity: 3,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 5',
    type: 'work',
    capacity: 4,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 6',
    type: 'work',
    capacity: 5,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 7',
    type: 'work',
    capacity: 3,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 8',
    type: 'work',
    capacity: 4,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 9',
    type: 'work',
    capacity: 5,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 10',
    type: 'work',
    capacity: 3,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 11',
    type: 'work',
    capacity: 4,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 12',
    type: 'work',
    capacity: 5,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 13',
    type: 'work',
    capacity: 3,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 14',
    type: 'work',
    capacity: 4,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 15',
    type: 'work',
    capacity: 5,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 16',
    type: 'work',
    capacity: 3,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 17',
    type: 'work',
    capacity: 4,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 18',
    type: 'work',
    capacity: 5,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 19',
    type: 'work',
    capacity: 3,
    status: 'available',
    isBooked: false,
  },
  {
    name: 'Cabin 20',
    type: 'work',
    capacity: 4,
    status: 'available',
    isBooked: false,
  },
];

const seedCabins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing cabins (optional - comment out if you want to keep existing data)
    await Cabin.deleteMany({});
    console.log('🗑️  Cleared existing cabins');

    // Insert cabins
    const cabins = await Cabin.insertMany(cabinsData);
    console.log(`✅ Successfully seeded ${cabins.length} cabins:`);
    console.log(`   - ${cabins.filter(c => c.type === 'conference').length} Conference Rooms`);
    console.log(`   - ${cabins.filter(c => c.type === 'work').length} Work Cabins`);

    // Display summary
    console.log('\n📊 Summary:');
    cabins.forEach(cabin => {
      if (cabin.type === 'conference') {
        console.log(`   ${cabin.name} (${cabin.type})`);
      } else {
        console.log(`   ${cabin.name} (${cabin.type}, capacity: ${cabin.capacity})`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding cabins:', error);
    process.exit(1);
  }
};

// Run the seed function
seedCabins();

