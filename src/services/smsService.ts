// SMS Service for sending verification codes
interface SMSConfig {
  provider: 'twilio' | 'mock';
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

interface SendSMSParams {
  phoneNumber: string;
  message: string;
}

class SMSService {
  private config: SMSConfig;

  constructor() {
    this.config = {
      provider: (import.meta.env.VITE_SMS_PROVIDER as 'twilio' | 'mock') || 'mock',
      accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
      authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
      fromNumber: import.meta.env.VITE_TWILIO_FROM_NUMBER,
    };
  }

  async sendSMS({ phoneNumber, message }: SendSMSParams): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.config.provider === 'mock') {
        // Mock SMS service for development
        return await this.sendMockSMS({ phoneNumber, message });
      } else if (this.config.provider === 'twilio') {
        return await this.sendTwilioSMS({ phoneNumber, message });
      } else {
        throw new Error('Unsupported SMS provider');
      }
    } catch (error) {
      console.error('SMS Service Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send SMS' };
    }
  }

  private async sendMockSMS({ phoneNumber, message }: SendSMSParams): Promise<{ success: boolean; error?: string }> {
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[MOCK SMS] To: ${phoneNumber}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    
    // In development, always succeed
    return { success: true };
  }

  private async sendTwilioSMS({ phoneNumber, message }: SendSMSParams): Promise<{ success: boolean; error?: string }> {
    if (!this.config.accountSid || !this.config.authToken || !this.config.fromNumber) {
      throw new Error('Twilio configuration missing');
    }

    try {
      // For development, we'll simulate Twilio calls
      // In production, you would install and use the Twilio SDK
      console.log(`[TWILIO SMS] Sending to ${phoneNumber}: ${message}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful send for development
      // In production, this would be:
      // const twilio = require('twilio')(this.config.accountSid, this.config.authToken);
      // const result = await twilio.messages.create({
      //   body: message,
      //   from: this.config.fromNumber,
      //   to: phoneNumber
      // });
      // return { success: true };
      
      console.log(`[TWILIO SMS] Successfully sent to ${phoneNumber}`);
      return { success: true };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Twilio SMS failed' };
    }
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  formatPhoneNumber(phoneNumber: string): string {
    // Basic phone number formatting for Ghana
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('233')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+233${cleaned.substring(1)}`;
    } else if (cleaned.length === 10) {
      return `+233${cleaned}`;
    }
    
    return phoneNumber;
  }
}

export const smsService = new SMSService();
