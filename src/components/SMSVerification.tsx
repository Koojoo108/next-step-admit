import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail, ArrowRight } from 'lucide-react';
import { smsVerificationService } from '@/services/smsVerificationService';

interface SMSVerificationProps {
  phone: string;
  onVerified: (success: boolean, error?: string) => void;
  onBack: () => void;
}

const SMSVerification = ({ phone, onVerified, onBack }: SMSVerificationProps) => {
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    setSending(true);
    setError(null);
    
    try {
      const result = await smsVerificationService.sendVerificationCode({ phoneNumber: phone });
      
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Failed to send verification code');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const result = await smsVerificationService.verifyCode({ phoneNumber: phone, code });
      
      if (result.success) {
        onVerified(true);
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    setSent(false);
    setCode('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-muted rounded-lg p-3">
          <Phone className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground">Send verification code to {phone}</span>
        </div>
      </div>

      {!sent ? (
        <Button 
          onClick={handleSendCode} 
          disabled={sending}
          className="w-full h-12 rounded-xl"
          variant="outline"
        >
          {sending ? 'Sending...' : 'Send Verification Code'}
          <Mail className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <p className="text-sm text-success font-medium">
              <strong>Verification code sent!</strong> Please check your messages and enter the 6-digit code below.
            </p>
          </div>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider">Verification Code</Label>
            <Input 
              id="code"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="h-12 rounded-xl text-center text-lg font-mono"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleVerify}
              disabled={verifying || code.length !== 6}
              className="flex-1 h-12 rounded-xl"
            >
              {verifying ? 'Verifying...' : 'Verify'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={onBack}
              variant="ghost"
              className="flex-1 h-12 rounded-xl"
            >
              Back
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-primary hover:underline font-medium"
            >
              Didn't receive the code? Resend
            </button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>For development: Check the console for the verification code</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMSVerification;
