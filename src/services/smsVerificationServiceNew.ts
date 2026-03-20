import { supabase } from '@/integrations/supabase/client';
import { smsService } from './smsService';

interface SendVerificationCodeParams {
  phoneNumber: string;
}

interface VerifyCodeParams {
  phoneNumber: string;
  code: string;
}

interface VerifyCodeResult {
  success: boolean;
  userId?: string;
  error?: string;
}

interface SendCodeResult {
  success: boolean;
  error?: string;
}

// In-memory storage for verification codes (for development)
const verificationCodes = new Map<string, { code: string; expiresAt: Date; phoneNumber: string }>();

class SMSVerificationService {
  async sendVerificationCode({ phoneNumber }: SendVerificationCodeParams): Promise<SendCodeResult> {
    try {
      // Format phone number
      const formattedPhone = smsService.formatPhoneNumber(phoneNumber);
      
      // Check if user exists with this phone number
      const { data: applicationData, error: fetchError } = await supabase
        .from('applications')
        .select('user_id, phone_number')
        .eq('phone_number', formattedPhone)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking phone number:', fetchError);
        return { success: false, error: 'Failed to verify phone number' };
      }

      if (!applicationData) {
        return { success: false, error: 'No account found with this phone number' };
      }

      // Generate verification code
      const verificationCode = smsService.generateVerificationCode();
      
      // Set expiration time (5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      // Store verification code in memory (for development)
      verificationCodes.set(formattedPhone, {
        code: verificationCode,
        expiresAt,
        phoneNumber: formattedPhone
      });

      // Send SMS with verification code
      const message = `Your Prestige SHS verification code is: ${verificationCode}. This code expires in 5 minutes.`;
      const smsResult = await smsService.sendSMS({
        phoneNumber: formattedPhone,
        message,
      });

      if (!smsResult.success) {
        // Clean up the stored code if SMS fails
        verificationCodes.delete(formattedPhone);
        return { success: false, error: smsResult.error || 'Failed to send SMS' };
      }

      console.log(`[SMS VERIFICATION] Code sent to ${formattedPhone}: ${verificationCode}`);
      return { success: true };
    } catch (error) {
      console.error('SMS verification service error:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  }

  async verifyCode({ phoneNumber, code }: VerifyCodeParams): Promise<VerifyCodeResult> {
    try {
      // Format phone number
      const formattedPhone = smsService.formatPhoneNumber(phoneNumber);
      
      // Find stored verification code
      const storedCode = verificationCodes.get(formattedPhone);
      
      if (!storedCode) {
        return { success: false, error: 'No verification code found for this phone number' };
      }

      // Check if code has expired
      if (new Date() > storedCode.expiresAt) {
        verificationCodes.delete(formattedPhone);
        return { success: false, error: 'Verification code has expired' };
      }

      // Check if code matches
      if (storedCode.code !== code) {
        return { success: false, error: 'Invalid verification code' };
      }

      // Find user with this phone number
      const { data: applicationData, error: fetchError } = await supabase
        .from('applications')
        .select('user_id, phone_number')
        .eq('phone_number', formattedPhone)
        .single();

      if (fetchError || !applicationData) {
        return { success: false, error: 'User not found with this phone number' };
      }

      // Clean up the used verification code
      verificationCodes.delete(formattedPhone);

      return { success: true, userId: applicationData.user_id };
    } catch (error) {
      console.error('Code verification error:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  }

  // Clean up expired codes (call this periodically)
  cleanupExpiredCodes(): void {
    const now = new Date();
    for (const [phone, codeData] of verificationCodes.entries()) {
      if (now > codeData.expiresAt) {
        verificationCodes.delete(phone);
      }
    }
  }

  // Get stored code for testing (development only)
  getStoredCode(phoneNumber: string): string | undefined {
    const formattedPhone = smsService.formatPhoneNumber(phoneNumber);
    const storedCode = verificationCodes.get(formattedPhone);
    return storedCode?.code;
  }
}

export const smsVerificationService = new SMSVerificationService();

// Clean up expired codes every minute
setInterval(() => {
  smsVerificationService.cleanupExpiredCodes();
}, 60000);
