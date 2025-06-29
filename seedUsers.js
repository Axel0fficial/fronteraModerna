// seedUsers.js
// Independent script to seed users via API after server startup
// Usage:
// 1. npm install axios
// 2. node seedUsers.js

const axios = require('axios');

// Adjust if your API host/port differs
const API_HOST = process.env.API_HOST || 'http://localhost:3000';

// List of users to seed
const users = [
  {
    username: 'visitor1',
    password: 'visit',
    email: 'visitor1@example.com',
    role: 'visitorUser',
    age: 25,
    birthday: '2000-01-01',
    nationalIdNumber: '11111111-1',
    passportNumber: 'V1234567',
    passportExpiry: '2030-01-01'
    // drivingLicense* fields are optional and can be omitted
  },
  {
    username: 'mod1',
    password: 'mod',
    email: 'mod1@example.com',
    role: 'moderator',
    age: 30,
    birthday: '1995-06-18',
    nationalIdNumber: '22222222-2',
    passportNumber: 'M2345678',
    passportExpiry: '2031-06-18'
  },
  {
    username: 'support1',
    password: 'sup',
    email: 'support1@example.com',
    role: 'supportUser',
    age: 35,
    birthday: '1990-12-01',
    nationalIdNumber: '33333333-3',
    passportNumber: 'S3456789',
    passportExpiry: '2029-12-01'
  },
  {
    username: 'admin',
    password: 'admin',
    email: 'admin1@example.com',
    role: 'admin',
    age: 40,
    birthday: '1985-08-15',
    nationalIdNumber: '44444444-4',
    passportNumber: 'A4567890',
    passportExpiry: '2028-08-15'
  },
  {
    username: 'under',
    password: 'under',
    email: 'underage1@example.com',
    role: 'visitorUser',
    age: 16,
    birthday: '2008-06-01',
    nationalIdNumber: '55555555-5',
    passportNumber: 'U1234567',
    passportExpiry: '2028-06-01',
    parentFirstName: 'Jane',
    parentLastName: 'Doe',
    parentNationalId: '44444444-4'
  }
];

async function seedUsers() {
  console.log('Seeding users...');
  for (const user of users) {
    try {
      const response = await axios.post(
        `${API_HOST}/api/auth/register`,
        user,
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(`✔️  Created ${response.data.username} (ID: ${response.data.id}, Role: ${response.data.role})`);
    } catch (err) {
      if (err.response) {
        console.error(`❌ Failed ${user.username}:`, err.response.data.error);
      } else {
        console.error(`❌ Error for ${user.username}:`, err.message);
      }
    }
  }
  console.log('Seeding complete.');
}

seedUsers();
