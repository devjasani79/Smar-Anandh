import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, Delete, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SeniorAuth() {
  const navigate = useNavigate();
  const { validateDualKey, seniorSession } = useAuth();
  
  const [step, setStep] = useState<'phone' | 'pin'>('phone');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect
  if (seniorSession) {
    navigate('/app');
    return null;
  }

  const handlePhoneSubmit = () => {
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setStep('pin');
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 4) {
        handlePinSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handlePinSubmit = async (submittedPin: string) => {
    setIsValidating(true);
    setError('');

    const result = await validateDualKey(phone, submittedPin);

    if (result.success) {
      toast.success('Welcome!');
      navigate('/app');
    } else {
      setError(result.error || 'Invalid credentials');
      setPin('');
    }

    setIsValidating(false);
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-8 text-center"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Back</span>
        </Link>
        
        <div className="mb-2">
          <span className="text-5xl">🙏</span>
        </div>
        <h1 
          className="text-3xl font-bold text-foreground mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          SmarAnandh
        </h1>
        <p 
          className="text-lg text-muted-foreground"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {step === 'phone' ? 'Enter Guardian Phone Number' : 'Enter Your Family PIN'}
        </p>
      </motion.header>

      {/* Phone Entry Step */}
      {step === 'phone' && (
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 px-6 pb-8"
        >
          <div className="max-w-md mx-auto">
            <div className="space-y-4 mb-8">
              <Label htmlFor="phone" className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Guardian ka Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                placeholder="9876543210"
                className="h-16 text-2xl text-center rounded-2xl font-mono"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Guardian ka registered phone number daalen (with or without +91)
              </p>
              {error && (
                <p className="text-center text-destructive">{error}</p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePhoneSubmit}
              className="w-full py-5 rounded-2xl bg-primary text-primary-foreground text-xl font-semibold shadow-xl"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Aage Badhein →
            </motion.button>

            <p className="mt-6 text-center text-sm text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Phone number wahi daalen jo Guardian ne register kiya hai
            </p>
          </div>
        </motion.main>
      )}

      {/* PIN Entry Step */}
      {step === 'pin' && (
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 px-6 pb-8 flex flex-col"
        >
          <div className="max-w-sm mx-auto flex-1 flex flex-col justify-center">
            {/* PIN display */}
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  animate={{
                    scale: pin.length > index ? 1.1 : 1,
                    backgroundColor: pin.length > index ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                  }}
                  className="w-5 h-5 rounded-full"
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-destructive mb-4 text-lg"
              >
                {error}
              </motion.p>
            )}

            {/* Loading indicator */}
            {isValidating && (
              <div className="flex justify-center mb-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-4">
              {digits.map((digit, index) => {
                if (digit === '') {
                  return <div key={index} className="aspect-square" />;
                }
                
                if (digit === 'del') {
                  return (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDelete}
                      disabled={isValidating || pin.length === 0}
                      className="aspect-square rounded-2xl bg-muted flex items-center justify-center
                                 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Delete className="w-8 h-8 text-muted-foreground" />
                    </motion.button>
                  );
                }

                return (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDigitPress(digit)}
                    disabled={isValidating || pin.length >= 4}
                    className="aspect-square rounded-2xl bg-card shadow-lg hover:shadow-xl
                               text-4xl font-bold text-foreground
                               disabled:opacity-50 transition-shadow
                               border-2 border-border"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {digit}
                  </motion.button>
                );
              })}
            </div>

            {/* Back button */}
            <button
              onClick={() => {
                setStep('phone');
                setPin('');
                setError('');
              }}
              className="mt-8 text-muted-foreground hover:text-foreground transition-colors text-center"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              ← Phone Number Change Karein
            </button>
          </div>
        </motion.main>
      )}
    </div>
  );
}
