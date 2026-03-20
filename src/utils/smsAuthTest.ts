import { smsVerificationService } from '../services/smsVerificationService';

// Test function to verify SMS authentication system
export const testSMSAuth = async () => {
  console.log('🧪 Testing SMS Authentication System...');
  
  const testPhone = '+233501234567';
  const testCode = '123456';
  
  try {
    // Test sending SMS code
    console.log('📱 Testing SMS code sending...');
    const sendResult = await smsVerificationService.sendVerificationCode({ phoneNumber: testPhone });
    
    if (sendResult.success) {
      console.log('✅ SMS code sent successfully');
      
      // Get the stored code for verification
      const storedCode = smsVerificationService.getStoredCode(testPhone);
      console.log(`🔍 Stored code: ${storedCode}`);
      
      // Test code verification
      console.log('🔍 Testing code verification...');
      const verifyResult = await smsVerificationService.verifyCode({ phoneNumber: testPhone, code: storedCode || testCode });
      
      if (verifyResult.success) {
        console.log('✅ Code verification successful!');
        console.log(`👤 User ID: ${verifyResult.userId}`);
      } else {
        console.log('❌ Code verification failed:', verifyResult.error);
      }
    } else {
      console.log('❌ SMS code sending failed:', sendResult.error);
    }
  } catch (error) {
    console.error('🚨 Test failed:', error);
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testSMSAuth();
  }, 2000);
}
