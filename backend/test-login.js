import axios from 'axios';

const testLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'achyutsidhantofficial@gmail.com',
      password: 'Ac@020825'
    });
    
    console.log('Login Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data.role) {
      console.log('✅ Role field is included:', response.data.data.role);
    } else {
      console.log('❌ Role field is missing');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testLogin(); 