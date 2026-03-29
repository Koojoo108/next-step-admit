// SMS Verification Service - Placeholder
// The applications table doesn't have a phone_number column,
// so this service is disabled until the schema is updated.

interface SendVerificationCodeParams {
  phoneNumber: string;
}

interface VerifyCodeParams {
  phoneNumber: string;
  code: string;
}

interface SendCodeResult {
  success: boolean;
  error?: string;
}

interface VerifyCodeResult {
  success: boolean;
  error?: string;
  userId?: string;
}

class SMSVerificationServiceNew {
  async sendVerificationCode({ phoneNumber }: SendVerificationCodeParams): Promise<SendCodeResult> {
    console.log('[SMSVerification] Service not configured. Phone:', phoneNumber);
    return { success: false, error: 'SMS verification is not yet configured.' };
  }

  async verifyCode({ phoneNumber, code }: VerifyCodeParams): Promise<VerifyCodeResult> {
    console.log('[SMSVerification] Service not configured. Phone:', phoneNumber);
    return { success: false, error: 'SMS verification is not yet configured.' };
  }
}

export const smsVerificationServiceNew = new SMSVerificationServiceNew();
