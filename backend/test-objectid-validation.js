import mongoose from 'mongoose';

const testIds = [
  '6946b05dd47e4d2a1c879a',  // From frontend error
  '693479535d6bc1e4dba73159', // From working API test
  '507f1f77bcf86cd799439011', // Valid example
  'invalid-id',               // Invalid example
  '6946b05dd47e4d2a1c879a1', // 25 chars
  '6946b05dd47e4d2a1c879',   // 23 chars
];

console.log('🧪 Testing ObjectId Validation');
console.log('=' .repeat(50));

testIds.forEach((id, index) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  const length = id.length;
  const isHex = /^[a-f\d]+$/i.test(id);
  
  console.log(`${index + 1}. ID: ${id}`);
  console.log(`   Length: ${length} chars`);
  console.log(`   Is Hex: ${isHex}`);
  console.log(`   mongoose.Types.ObjectId.isValid(): ${isValid}`);
  console.log(`   Manual regex test: ${/^[a-f\d]{24}$/i.test(id)}`);
  console.log('');
});

// Test creating ObjectId from the problematic ID
const problematicId = '6946b05dd47e4d2a1c879a';
console.log(`🔍 Testing ObjectId creation for: ${problematicId}`);
try {
  const objectId = new mongoose.Types.ObjectId(problematicId);
  console.log('✅ Successfully created ObjectId:', objectId);
} catch (error) {
  console.log('❌ Failed to create ObjectId:', error.message);
}