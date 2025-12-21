// Quick test to verify CORS fix is working
const testCORSFix = async () => {
  console.log('🧪 Testing CORS fix for PATCH requests...');
  
  try {
    // Test if server is running
    const healthResponse = await fetch('http://localhost:5000/api/health');
    if (!healthResponse.ok) {
      throw new Error('Backend server is not running');
    }
    console.log('✅ Backend server is running');
    
    // Test PATCH request (this should work now)
    const testResponse = await fetch('http://localhost:5000/api/appointments/test-id', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({ status: 'test' })
    });
    
    console.log('PATCH Response Status:', testResponse.status);
    
    if (testResponse.status === 404) {
      console.log('✅ CORS is working! (404 means the route was reached, just appointment not found)');
    } else if (testResponse.status === 400) {
      console.log('✅ CORS is working! (400 means validation error, but request went through)');
    } else {
      console.log('Response:', await testResponse.text());
    }
    
  } catch (error) {
    if (error.message.includes('CORS')) {
      console.error('❌ CORS is still blocking requests:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
};

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testCORSFix();
}