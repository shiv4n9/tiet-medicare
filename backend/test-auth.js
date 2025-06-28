import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'password123'
};

let authToken = null;

// Test functions
const testHealthCheck = async () => {
  try {
    console.log('🔍 Testing health check...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

const testRegistration = async () => {
  try {
    console.log('🔍 Testing user registration...');
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', response.data.message);
    authToken = response.data.data.token;
    return true;
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data?.message || error.message);
    return false;
  }
};

const testLogin = async () => {
  try {
    console.log('🔍 Testing user login...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', response.data.message);
    authToken = response.data.data.token;
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
};

const testGetProfile = async () => {
  if (!authToken) {
    console.log('⚠️  Skipping profile test - no auth token');
    return false;
  }

  try {
    console.log('🔍 Testing get profile...');
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get profile successful:', response.data.data.name);
    return true;
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data?.message || error.message);
    return false;
  }
};

const testUpdateProfile = async () => {
  if (!authToken) {
    console.log('⚠️  Skipping profile update test - no auth token');
    return false;
  }

  try {
    console.log('🔍 Testing profile update...');
    const response = await axios.put(`${API_BASE_URL}/auth/profile`, {
      name: 'Updated Test User'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile update successful:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Profile update failed:', error.response?.data?.message || error.message);
    return false;
  }
};

const testLogout = async () => {
  if (!authToken) {
    console.log('⚠️  Skipping logout test - no auth token');
    return false;
  }

  try {
    console.log('🔍 Testing logout...');
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Logout successful:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Logout failed:', error.response?.data?.message || error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting authentication tests...\n');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Registration', fn: testRegistration },
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'Logout', fn: testLogout }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) passed++;
    console.log('---\n');
  }

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your authentication backend is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check your backend configuration.');
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests }; 