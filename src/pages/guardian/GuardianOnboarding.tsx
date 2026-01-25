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
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Skip onboarding if seniors already exist
  useEffect(() => {
    if (!loading && linkedSeniors && linkedSeniors.length > 0) {
      navigate('/guardian', { replace: true });
    }
  }, [linkedSeniors, loading, navigate]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `seniors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('senior-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('senior-photos')
        .getPublicUrl(filePath);

      setSeniorData({ ...seniorData, photoUrl: publicUrl });
      toast.success('Photo uploaded!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo. Ensure "senior-photos" bucket is public.');
    }
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
      toast.error("Please enter senior's name");
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. CRITICAL: Upsert the 'guardian' role first
      // This satisfies the RLS policy: "Guardians can insert seniors"
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: user!.id, 
          role: 'guardian' 
        }, { onConflict: 'user_id, role' });

      if (roleError) {
        console.error("Role Assignment Error:", roleError);
        throw new Error("Could not assign Guardian role. Check database user_roles table.");
      }

      // 2. Create senior record
      const { data: senior, error: seniorError } = await supabase
        .from('seniors')
        .insert({
          name: seniorData.name,
          preferred_name: seniorData.preferredName || null,
          language: seniorData.language,
          photo_url: seniorData.photoUrl,
          family_pin: pin,
          guardian_email: user!.email,
          user_id: user!.id
        })
        .select()
        .single();

      if (seniorError) throw seniorError;

      // 3. Create guardian-senior link
      const { error: linkError } = await supabase
        .from('guardian_senior_links')
        .insert({
          guardian_id: user!.id,
          senior_id: senior.id,
          relationship: 'family',
          is_primary: true
        });

      if (linkError) throw linkError;

      // 4. Create default joy preferences
      await supabase
        .from('joy_preferences')
        .insert({
          senior_id: senior.id,
          ai_suggestions_enabled: true
        });

      await refreshLinkedSeniors();
      toast.success('Setup complete! Welcome to SmarAnandh 🙏');
      navigate('/guardian');
    } catch (error: any) {
      console.error('Onboarding error detail:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
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
      <header className="px-6 py-8 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">🙏 Welcome to SmarAnandh</h1>
          <p className="text-muted-foreground mb-6">Let's set up your loved one's companion</p>
          <div className="flex gap-4">
            {steps.map((s) => (
              <div 
                key={s.number}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  step === s.number ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s.number ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                <span className="font-medium">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold mb-2">Tell us about your loved one</h2>
                  <p className="text-muted-foreground">This helps us personalize their experience</p>
                </div>

                <div className="flex justify-center mb-6">
                  <label className="cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-primary/20">
                      {seniorData.photoUrl ? (
                        <img src={seniorData.photoUrl} alt="Senior" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <p className="text-center mt-2 text-sm text-muted-foreground">Add photo</p>
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={seniorData.name} onChange={(e) => setSeniorData({ ...seniorData, name: e.target.value })} placeholder="e.g., Ramesh Kumar" className="h-14 text-lg rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred Name / Nickname</Label>
                  <Input id="preferredName" value={seniorData.preferredName} onChange={(e) => setSeniorData({ ...seniorData, preferredName: e.target.value })} placeholder="e.g., Bauji, Nani" className="h-14 text-lg rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label>Language Preference</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['hinglish', 'hindi', 'english'].map((l) => (
                      <button 
                        key={l} 
                        type="button" 
                        onClick={() => setSeniorData({ ...seniorData, language: l })}
                        className={`py-3 rounded-xl capitalize ${seniorData.language === l ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <TactileButton onClick={() => seniorData.name.trim() ? setStep(2) : toast.error("Name is required")} variant="primary" size="large" className="w-full">
                  Continue <ChevronRight className="w-5 h-5 ml-2" />
                </TactileButton>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <Key className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-bold">Set a Family PIN</h2>
                  <p className="text-muted-foreground">Used for the senior companion app</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Create 4-Digit PIN</Label>
                    <Input type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} className="h-16 text-2xl text-center tracking-[1rem]" />
                  </div>
                  <div>
                    <Label>Confirm PIN</Label>
                    <Input type="password" maxLength={4} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} className="h-16 text-2xl text-center tracking-[1rem]" />
                  </div>
                </div>

                {pinError && <p className="text-center text-destructive">{pinError}</p>}

                <div className="flex gap-4">
                  <TactileButton onClick={() => setStep(1)} variant="neutral" className="flex-1">Back</TactileButton>
                  <TactileButton onClick={handleComplete} disabled={isSubmitting} variant="primary" className="flex-1">
                    {isSubmitting ? 'Saving...' : 'Complete'}
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
