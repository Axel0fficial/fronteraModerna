// testApi.js
// Standalone script to test all main API endpoints and log pass/fail.
// Usage:
//   npm install axios form-data fs
//   node testApi.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_HOST = process.env.API_HOST || 'http://localhost:3000';

// Utility: pause between tests
const wait = ms => new Promise(res => setTimeout(res, ms));

// Store tokens and IDs across tests
const context = {};

// Define test cases
const tests = [
  {
    name: 'Register visitorUser',
    fn: async () => {
      const res = await axios.post(`${API_HOST}/api/auth/register`, {
        username: 'testvisitor',
        password: 'Test@1234',
        email: 'visitor@test.com',
        age: 20
      });
      context.visitorToken = await login('testvisitor','Test@1234');
      return res.status === 200;
    }
  },
  {
    name: 'Register underage user fails without guardian',
    fn: async () => {
      try {
        await axios.post(`${API_HOST}/api/auth/register`, {
          username: 'kid', password: 'Kid@123', email: 'kid@test.com', age: 15
        });
        return false;
      } catch (err) {
        return err.response.status === 400;
      }
    }
  },
  {
    name: 'Register underage with guardian',
    fn: async () => {
      const res = await axios.post(`${API_HOST}/api/auth/register`, {
        username: 'kid2', password: 'Kid2@123', email: 'kid2@test.com', age: 15,
        parentFirstName: 'Jane', parentLastName: 'Doe', parentNationalId: '12345678-9'
      });
      context.kidToken = await login('kid2','Kid2@123');
      return res.status === 200;
    }
  },
  {
    name: 'Admin creates moderator user',
    fn: async () => {
      // log in as admin first (assumes admin1 seeded)
      context.adminToken = await login('admin1','Admin@1234');
      const res = await axios.post(`${API_HOST}/api/users`, {
        username: 'modtest', password: 'Mod@1234', email: 'modtest@test.com', role: 'moderator', age:30
      }, { headers: { Authorization: 'Bearer '+context.adminToken } });
      context.modId = res.data.id;
      return res.status === 201;
    }
  },
  {
    name: 'List users as admin',
    fn: async () => {
      const res = await axios.get(`${API_HOST}/api/users`, {
        headers: { Authorization: 'Bearer '+context.adminToken }
      });
      return Array.isArray(res.data);
    }
  },
  {
    name: 'Update user role to support',
    fn: async () => {
      const res = await axios.patch(
        `${API_HOST}/api/users/${context.modId}`,
        { role: 'supportUser' },
        { headers: { Authorization: 'Bearer '+context.adminToken } }
      );
      return res.data.role === 'supportUser';
    }
  },
  {
    name: 'Delete test user',
    fn: async () => {
      const res = await axios.delete(
        `${API_HOST}/api/users/${context.modId}`,
        { headers: { Authorization: 'Bearer '+context.adminToken } }
      );
      return res.status === 204;
    }
  },
  {
    name: 'Upload form PDF as visitor',
    fn: async () => {
      const form = new FormData();
      form.append('pdf', fs.createReadStream('test.pdf'));
      const res = await axios.post(
        `${API_HOST}/api/forms/upload`, form,
        { headers: { Authorization: 'Bearer '+context.visitorToken, ...form.getHeaders() } }
      );
      return Array.isArray(res.data);
    }
  },
  {
    name: 'List own forms as visitor',
    fn: async () => {
      const res = await axios.get(
        `${API_HOST}/api/forms`,
        { headers: { Authorization: 'Bearer '+context.visitorToken } }
      );
      return Array.isArray(res.data);
    }
  },
  {
    name: 'Create support ticket',
    fn: async () => {
      const res = await axios.post(
        `${API_HOST}/api/support`, { message: 'Test ticket' },
        { headers: { Authorization: 'Bearer '+context.visitorToken } }
      );
      return res.status === 200 && res.data.message === 'Test ticket';
    }
  },
  {
    name: 'List tickets as supportUser',
    fn: async () => {
      // sign up a support user
      await axios.post(`${API_HOST}/api/auth/register`, { username:'sup',password:'Sup@1234',email:'sup@test.com',age:30,role:'supportUser' });
      context.supToken = await login('sup','Sup@1234');
      const res = await axios.get(
        `${API_HOST}/api/support`,
        { headers: { Authorization: 'Bearer '+context.supToken } }
      );
      return Array.isArray(res.data);
    }
  }
];

// Helper to login and save token
async function login(username, password) {
  const res = await axios.post(`${API_HOST}/api/auth/login`, { username, password });
  return res.data.token;
}

(async () => {
  console.log('Starting API tests against', API_HOST);
  for (const t of tests) {
    try {
      const ok = await t.fn();
      console.log(`${ok ? '✔' : '✖'} ${t.name}`);
    } catch (err) {
      console.error(`✖ ${t.name} - Error:`, err.response ? err.response.data : err.message);
    }
    await wait(200);
  }
  console.log('API tests complete.');
})();
