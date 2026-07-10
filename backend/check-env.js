/**
 * Quick script to check if .env is configured correctly
 */
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const PORT = process.env.PORT || 5001;

console.log('\n📋 Environment Check:');
console.log('====================');
console.log(`MONGO_URI: ${MONGO_URI ? '✅ Set' : '❌ Missing'}`);
console.log(`PORT: ${PORT}`);
console.log('');

if (!MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI is not set in .env file!');
  console.error('Please add: MONGO_URI=mongodb+srv://<username>:<password>@cluster0.rrpvsx6.mongodb.net/cabins?retryWrites=true&w=majority');
  process.exit(1);
} else {
  console.log('✅ Environment variables look good!');
  console.log('You can start the server with: npm run dev');
}

