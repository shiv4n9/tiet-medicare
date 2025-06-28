import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

console.log('🚀 Testing TIET Medicare Authentication Backend...\n');

// Test 1: Health Check
async function testHealth() {
  try {
    console.log('1. Testing Health Check...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check: PASSED');
    console.log('   Status:', response.data.status);
    console.log('   Database:', response.data.dbStatus);
    console.log('   Environment:', response.data.nodeEnv);
    return true;
  } catch (error) {
    console.log('❌ Health Check: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 2: User Registration
async function testRegistration() {
  try {
    console.log('\n2. Testing User Registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration: PASSED');
    console.log('   User ID:', response.data.data._id);
    console.log('   Token received:', response.data.data.token ? 'Yes' : 'No');
    return { success: true, user: testUser, token: response.data.data.token };
  } catch (error) {
    console.log('❌ Registration: FAILED');
    console.log('   Error:', error.response?.data?.message || error.message);
    return { success: false };
  }
}

// Test 3: User Login
async function testLogin(user) {
  try {
    console.log('\n3. Testing User Login...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });
    console.log('✅ Login: PASSED');
    console.log('   User authenticated:', response.data.data.name);
    return { success: true, token: response.data.data.token };
  } catch (error) {
    console.log('❌ Login: FAILED');
    console.log('   Error:', error.response?.data?.message || error.message);
    return { success: false };
  }
}

// Test 4: Get Profile (Protected Route)
async function testGetProfile(token) {
  try {
    console.log('\n4. Testing Get Profile (Protected Route)...');
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get Profile: PASSED');
    console.log('   User Name:', response.data.data.name);
    console.log('   User Email:', response.data.data.email);
    return true;
  } catch (error) {
    console.log('❌ Get Profile: FAILED');
    console.log('   Error:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 5: Update Profile
async function testUpdateProfile(token) {
  try {
    console.log('\n5. Testing Update Profile...');
    const response = await axios.put(`${API_BASE_URL}/auth/profile`, {
      name: 'Updated Test User'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Update Profile: PASSED');
    console.log('   Updated Name:', response.data.data.name);
    return true;
  } catch (error) {
    console.log('❌ Update Profile: FAILED');
    console.log('   Error:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 6: Logout
async function testLogout(token) {
  try {
    console.log('\n6. Testing Logout...');
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Logout: PASSED');
    console.log('   Message:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Logout: FAILED');
    console.log('   Error:', error.response?.data?.message || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  let passed = 0;
  let total = 6;

  // Test 1: Health Check
  const healthResult = await testHealth();
  if (healthResult) passed++;

  // Test 2: Registration
  const regResult = await testRegistration();
  if (regResult.success) passed++;

  // Test 3: Login
  let loginResult = { success: false };
  if (regResult.success) {
    loginResult = await testLogin(regResult.user);
    if (loginResult.success) passed++;
  }

  // Test 4: Get Profile
  let profileResult = false;
  if (loginResult.success) {
    profileResult = await testGetProfile(loginResult.token);
    if (profileResult) passed++;
  }

  // Test 5: Update Profile
  let updateResult = false;
  if (loginResult.success) {
    updateResult = await testUpdateProfile(loginResult.token);
    if (updateResult) passed++;
  }

  // Test 6: Logout
  let logoutResult = false;
  if (loginResult.success) {
    logoutResult = await testLogout(loginResult.token);
    if (logoutResult) passed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Tests Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('Your authentication backend is working perfectly!');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('Please check your backend configuration.');
  }
  
  console.log('\n🔗 Your API is ready at: http://localhost:5000/api');
  console.log('📚 Check the README.md for API documentation');
}

// Run the tests
runAllTests().catch(console.error); 