import axios from 'axios';

const testMeEndpoint = async () => {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'achyutsidhantofficial@gmail.com',
      password: 'Ac@020825'
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful, token received');
    
    // Now test the /api/auth/me endpoint
    const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Me endpoint response:');
    console.log(JSON.stringify(meResponse.data, null, 2));
    
    if (meResponse.data.data.role) {
      console.log('✅ Role field is present:', meResponse.data.data.role);
    } else {
      console.log('❌ Role field is missing');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testMeEndpoint(); 