import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Heart, 
  Key, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Upload,
  Camera
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TactileButton } from '@/components/TactileButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SeniorData {
  name: string;
  preferredName: string;
  language: string;
  photoUrl: string | null;
}

export default function GuardianOnboarding() {
  const navigate = useNavigate();
  const { user, loading, linkedSeniors, refreshLinkedSeniors } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step 1: Senior basics
  const [seniorData, setSeniorData] = useState<SeniorData>({
    name: '',
    preferredName: '',
    language: 'hinglish',
    photoUrl: null
  });
  
  // Step 2: Family PIN
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Skip onboarding if seniors already exist
  useEffect(() => {
    if (linkedSeniors.length > 0) {
      navigate('/guardian');
    }
  }, [linkedSeniors, navigate]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
    const filePath = `seniors/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('senior-photos')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Failed to upload photo');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('senior-photos')
      .getPublicUrl(filePath);

    setSeniorData({ ...seniorData, photoUrl: publicUrl });
    toast.success('Photo uploaded!');
  };

  const validatePin = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setPinError('PIN must be exactly 4 digits');
      return false;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match');
      return false;
    }
    setPinError('');
    return true;
  };

  const handleComplete = async () => {
    if (!validatePin()) return;
    if (!seniorData.name.trim()) {
      toast.error('Please enter senior\'s name');
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create senior record
      const { data: senior, error: seniorError } = await supabase
        .from('seniors')
        .insert({
          name: seniorData.name,
          preferred_name: seniorData.preferredName || null,
          language: seniorData.language,
          photo_url: seniorData.photoUrl,
          family_pin: pin,
          guardian_email: user!.email
        })
        .select()
        .single();

      if (seniorError) throw seniorError;

      // Create guardian-senior link
      const { error: linkError } = await supabase
        .from('guardian_senior_links')
        .insert({
          guardian_id: user!.id,
          senior_id: senior.id,
          relationship: 'family',
          is_primary: true
        });

      if (linkError) throw linkError;

      // Create default joy preferences
      await supabase
        .from('joy_preferences')
        .insert({
          senior_id: senior.id,
          ai_suggestions_enabled: true
        });

      await refreshLinkedSeniors();
      toast.success('Setup complete! Welcome to SmarAnandh.');
      navigate('/guardian');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Senior's Profile", icon: User },
    { number: 2, title: 'Set Family PIN', icon: Key }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Progress header */}
      <header className="px-6 py-8 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <h1 
            className="text-2xl font-bold text-foreground mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            🙏 Welcome to SmarAnandh
          </h1>
          <p className="text-muted-foreground mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Let's set up your loved one's companion
          </p>
          
          {/* Step indicators */}
          <div className="flex gap-4">
            {steps.map((s) => (
              <div 
                key={s.number}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  step === s.number 
                    ? 'bg-primary text-primary-foreground' 
                    : step > s.number 
                      ? 'bg-success/20 text-success'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
                <span className="font-medium" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Step content */}
      <main className="px-6 py-8">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Senior Profile */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Tell us about your loved one
                  </h2>
                  <p className="text-muted-foreground">
                    This helps us personalize their experience
                  </p>
                </div>

                {/* Photo upload */}
                <div className="flex justify-center mb-6">
                  <label className="cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-primary/20 hover:border-primary/50 transition-colors">
                      {seniorData.photoUrl ? (
                        <img 
                          src={seniorData.photoUrl} 
                          alt="Senior" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <p className="text-center mt-2 text-sm text-muted-foreground">
                      Add photo
                    </p>
                  </label>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-label">Full Name *</Label>
                  <Input
                    id="name"
                    value={seniorData.name}
                    onChange={(e) => setSeniorData({ ...seniorData, name: e.target.value })}
                    placeholder="e.g., Ramesh Kumar"
                    className="h-14 text-lg rounded-xl"
                  />
                </div>

                {/* Preferred name */}
                <div className="space-y-2">
                  <Label htmlFor="preferredName" className="text-label">
                    Preferred Name / Nickname
                  </Label>
                  <Input
                    id="preferredName"
                    value={seniorData.preferredName}
                    onChange={(e) => setSeniorData({ ...seniorData, preferredName: e.target.value })}
                    placeholder="e.g., Bauji, Nani, Captain"
                    className="h-14 text-lg rounded-xl"
                  />
                  <p className="text-sm text-muted-foreground">
                    How do they like to be called?
                  </p>
                </div>

                {/* Language preference */}
                <div className="space-y-2">
                  <Label className="text-label">Language Preference</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'hinglish', label: 'Hinglish' },
                      { value: 'hindi', label: 'Hindi' },
                      { value: 'english', label: 'English' }
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => setSeniorData({ ...seniorData, language: lang.value })}
                        className={`py-3 px-4 rounded-xl font-medium transition-all ${
                          seniorData.language === lang.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <TactileButton
                  onClick={() => {
                    if (!seniorData.name.trim()) {
                      toast.error('Please enter senior\'s name');
                      return;
                    }
                    setStep(2);
                  }}
                  variant="primary"
                  size="large"
                  className="w-full"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </TactileButton>
              </motion.div>
            )}

            {/* Step 2: Family PIN */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Key className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Set a Family PIN
                  </h2>
                  <p className="text-muted-foreground">
                    This 4-digit PIN will be used to access the senior companion app
                  </p>
                </div>

                {/* PIN input */}
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-label">Create PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPin(value);
                      setPinError('');
                    }}
                    placeholder="● ● ● ●"
                    className="h-16 text-2xl text-center rounded-xl tracking-[1rem] font-mono"
                  />
                </div>

                {/* Confirm PIN */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPin" className="text-label">Confirm PIN</Label>
                  <Input
                    id="confirmPin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setConfirmPin(value);
                      setPinError('');
                    }}
                    placeholder="● ● ● ●"
                    className="h-16 text-2xl text-center rounded-xl tracking-[1rem] font-mono"
                  />
                </div>

                {pinError && (
                  <p className="text-center text-destructive">{pinError}</p>
                )}

                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    💡 Share this PIN with your senior. They'll use your <strong>Phone Number + PIN</strong> to access their companion app.
                  </p>
                </div>

                <div className="flex gap-4">
                  <TactileButton
                    onClick={() => setStep(1)}
                    variant="neutral"
                    size="large"
                    className="flex-1"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </TactileButton>
                  
                  <TactileButton
                    onClick={handleComplete}
                    variant="primary"
                    size="large"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                    <Check className="w-5 h-5 ml-2" />
                  </TactileButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
