import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testConsultationFlow() {
  console.log('🧪 Testing Consultation Start Functionality');
  console.log('=' .repeat(50));

  try {
    // 1. Test appointments route
    console.log('1. Testing appointments route...');
    const appointmentsResponse = await axios.get(`${BASE_URL}/appointments`);
    console.log(`✅ Found ${appointmentsResponse.data.length} appointments`);
    
    if (appointmentsResponse.data.length === 0) {
      console.log('❌ No appointments found. Please create an appointment first.');
      return;
    }

    // 2. Get the first appointment
    const firstAppointment = appointmentsResponse.data[0];
    console.log(`\n2. Testing with appointment: ${firstAppointment._id}`);
    console.log(`   Patient: ${firstAppointment.name || firstAppointment.patientName}`);
    console.log(`   Status: ${firstAppointment.status}`);
    console.log(`   ID Length: ${firstAppointment._id.toString().length} chars`);
    console.log(`   Valid ObjectId: ${/^[a-f\d]{24}$/i.test(firstAppointment._id.toString())}`);

    // 3. Test PATCH route to start consultation
    console.log('\n3. Testing consultation start (PATCH)...');
    const patchResponse = await axios.patch(`${BASE_URL}/appointments/${firstAppointment._id}`, {
      status: 'in_progress',
      startedAt: new Date().toISOString()
    });
    
    console.log('✅ PATCH request successful!');
    console.log(`   New status: ${patchResponse.data.data.status}`);
    console.log(`   Started at: ${patchResponse.data.data.startedAt}`);

    // 4. Test completing consultation
    console.log('\n4. Testing consultation completion...');
    const completeResponse = await axios.patch(`${BASE_URL}/appointments/${firstAppointment._id}`, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    
    console.log('✅ Consultation completion successful!');
    console.log(`   Final status: ${completeResponse.data.data.status}`);
    console.log(`   Completed at: ${completeResponse.data.data.completedAt}`);

    console.log('\n🎉 All tests passed! Consultation flow is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testConsultationFlow();