import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Key, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Camera,
  Phone,
  Heart,
  Calendar,
  MapPin,
  AlertCircle
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
  dateOfBirth: string;
  gender: string;
  language: string;
  photoUrl: string | null;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  chronicConditions: string[];
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CHRONIC_CONDITIONS = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Arthritis', 
  'Asthma', 'Thyroid', 'Kidney Disease', 'None'
];

export default function GuardianOnboarding() {
  const navigate = useNavigate();
  const { user, loading, linkedSeniors, refreshLinkedSeniors, guardianProfile } = useAuth();
  const hasRedirected = useRef(false);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step 1: Senior KYC
  const [seniorData, setSeniorData] = useState<SeniorData>({
    name: '',
    preferredName: '',
    dateOfBirth: '',
    gender: 'male',
    language: 'hinglish',
    photoUrl: null,
    address: '',
    bloodGroup: '',
    emergencyContact: '',
    chronicConditions: []
  });
  
  // Step 2: Family PIN
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Skip onboarding if seniors already exist
  useEffect(() => {
    if (!loading && linkedSeniors && linkedSeniors.length > 0 && !hasRedirected.current) {
      hasRedirected.current = true;
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
      toast.error('Photo upload failed. Please try again.');
    }
  };

  const toggleCondition = (condition: string) => {
    if (condition === 'None') {
      setSeniorData({ ...seniorData, chronicConditions: ['None'] });
      return;
    }
    
    const current = seniorData.chronicConditions.filter(c => c !== 'None');
    if (current.includes(condition)) {
      setSeniorData({ ...seniorData, chronicConditions: current.filter(c => c !== condition) });
    } else {
      setSeniorData({ ...seniorData, chronicConditions: [...current, condition] });
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

  const validateStep1 = () => {
    if (!seniorData.name.trim()) {
      toast.error('Please enter senior\'s full name');
      return false;
    }
    if (!seniorData.preferredName.trim()) {
      toast.error('Please enter what they like to be called');
      return false;
    }
    return true;
  };

  const handleComplete = async () => {
    if (!validatePin()) return;
    if (!user) {
      toast.error('Session expired. Please login again.');
      navigate('/auth', { replace: true });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Ensure guardian role exists (use insert with onConflict to avoid duplicates)
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: user.id, 
          role: 'guardian' as const
        }, { 
          onConflict: 'user_id,role',
          ignoreDuplicates: true 
        });

      if (roleError) {
        console.error("Role assignment error:", roleError);
        // Continue anyway - role might already exist
      }

      // Step 2: Create senior record with all KYC data
      const { data: senior, error: seniorError } = await supabase
        .from('seniors')
        .insert({
          name: seniorData.name.trim(),
          preferred_name: seniorData.preferredName.trim() || null,
          language: seniorData.language,
          photo_url: seniorData.photoUrl,
          family_pin: pin,
          guardian_email: user.email,
          user_id: user.id,
          chronic_conditions: seniorData.chronicConditions.length > 0 
            ? seniorData.chronicConditions.filter(c => c !== 'None') 
            : null,
          // Store as array format for consistency
          emergency_contacts: seniorData.emergencyContact ? [
            {
              phone: seniorData.emergencyContact,
              name: guardianProfile?.fullName || 'Guardian',
              relationship: 'Primary Guardian'
            }
          ] : []
        })
        .select()
        .single();

      if (seniorError) {
        console.error("Senior creation error:", seniorError);
        throw new Error(seniorError.message || 'Failed to create senior profile');
      }

      if (!senior) {
        throw new Error('Senior profile was not created');
      }

      // Step 3: Create guardian-senior link
      const { error: linkError } = await supabase
        .from('guardian_senior_links')
        .insert({
          guardian_id: user.id,
          senior_id: senior.id,
          relationship: 'family',
          is_primary: true
        });

      if (linkError) {
        console.error("Link creation error:", linkError);
        // Don't throw - senior was created successfully
      }

      // Step 4: Create default joy preferences
      await supabase
        .from('joy_preferences')
        .insert({
          senior_id: senior.id,
          ai_suggestions_enabled: true
        });

      await refreshLinkedSeniors();
      toast.success('Setup complete! Welcome to SmarAnandh 🙏');
      
      // Use setTimeout to ensure state updates before navigation
      setTimeout(() => {
        navigate('/guardian', { replace: true });
      }, 100);
      
    } catch (error: any) {
      console.error('Onboarding error:', error);
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
      {/* Header */}
      <header className="px-6 py-6 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                Welcome to SmarAnandh
              </h1>
              <p className="text-sm text-muted-foreground">Let's set up your loved one's companion</p>
            </div>
          </div>
          
          {/* Step indicators */}
          <div className="flex gap-3">
            {steps.map((s) => (
              <div 
                key={s.number}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  step === s.number 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
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
                <span className="font-medium text-sm">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Tell us about your loved one
                  </h2>
                  <p className="text-muted-foreground mt-2">This helps us personalize their experience</p>
                </div>

                {/* Photo Upload */}
                <div className="flex justify-center mb-6">
                  <label className="cursor-pointer group">
                    <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden 
                                    border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                      {seniorData.photoUrl ? (
                        <img src={seniorData.photoUrl} alt="Senior" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <p className="text-center mt-2 text-sm text-muted-foreground">Add photo</p>
                  </label>
                </div>

                <div className="grid gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Full Name *
                    </Label>
                    <Input 
                      id="name" 
                      value={seniorData.name} 
                      onChange={(e) => setSeniorData({ ...seniorData, name: e.target.value })} 
                      placeholder="e.g., Ramesh Kumar Sharma" 
                      className="h-14 text-lg rounded-xl" 
                    />
                  </div>

                  {/* Preferred Name */}
                  <div className="space-y-2">
                    <Label htmlFor="preferredName" className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      What do they like to be called? *
                    </Label>
                    <Input 
                      id="preferredName" 
                      value={seniorData.preferredName} 
                      onChange={(e) => setSeniorData({ ...seniorData, preferredName: e.target.value })} 
                      placeholder="e.g., Bauji, Nani, Papa" 
                      className="h-14 text-lg rounded-xl" 
                    />
                    <p className="text-xs text-muted-foreground">This is how we'll address them in the app</p>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'other'].map((g) => (
                        <button 
                          key={g} 
                          type="button" 
                          onClick={() => setSeniorData({ ...seniorData, gender: g })}
                          className={`py-3 rounded-xl capitalize transition-all ${
                            seniorData.gender === g 
                              ? 'bg-primary text-primary-foreground shadow-md' 
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {g === 'male' ? '👨 Male' : g === 'female' ? '👩 Female' : '🧓 Other'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language Preference */}
                  <div className="space-y-2">
                    <Label>Language Preference</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'hinglish', label: 'Hinglish' },
                        { value: 'hindi', label: 'हिंदी' },
                        { value: 'english', label: 'English' }
                      ].map((l) => (
                        <button 
                          key={l.value} 
                          type="button" 
                          onClick={() => setSeniorData({ ...seniorData, language: l.value })}
                          className={`py-3 rounded-xl transition-all ${
                            seniorData.language === l.value 
                              ? 'bg-primary text-primary-foreground shadow-md' 
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-2">
                    <Label>Blood Group (Optional)</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_GROUPS.map((bg) => (
                        <button 
                          key={bg} 
                          type="button" 
                          onClick={() => setSeniorData({ ...seniorData, bloodGroup: bg })}
                          className={`py-2 rounded-lg text-sm transition-all ${
                            seniorData.bloodGroup === bg 
                              ? 'bg-destructive/20 text-destructive font-semibold' 
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chronic Conditions */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      Any Chronic Conditions? (Select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {CHRONIC_CONDITIONS.map((condition) => (
                        <button 
                          key={condition} 
                          type="button" 
                          onClick={() => toggleCondition(condition)}
                          className={`py-2 px-3 rounded-lg text-sm transition-all ${
                            seniorData.chronicConditions.includes(condition)
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-2">
                    <Label htmlFor="emergency" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Emergency Contact Number
                    </Label>
                    <Input 
                      id="emergency" 
                      type="tel"
                      value={seniorData.emergencyContact} 
                      onChange={(e) => setSeniorData({ ...seniorData, emergencyContact: e.target.value })} 
                      placeholder="+91 98765 43210" 
                      className="h-14 text-lg rounded-xl" 
                    />
                  </div>
                </div>

                <TactileButton 
                  onClick={() => validateStep1() && setStep(2)} 
                  variant="primary" 
                  size="large" 
                  className="w-full mt-6"
                >
                  Continue <ChevronRight className="w-5 h-5 ml-2" />
                </TactileButton>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Key className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Create Family PIN
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    This 4-digit PIN will be used by {seniorData.preferredName || 'your loved one'} to access their companion app
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-6">
                  <div className="space-y-2">
                    <Label className="text-center block">Create 4-Digit PIN</Label>
                    <Input 
                      type="password" 
                      inputMode="numeric"
                      maxLength={4} 
                      value={pin} 
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
                      className="h-16 text-3xl text-center tracking-[1.5rem] font-mono rounded-xl"
                      placeholder="••••"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-center block">Confirm PIN</Label>
                    <Input 
                      type="password" 
                      inputMode="numeric"
                      maxLength={4} 
                      value={confirmPin} 
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} 
                      className="h-16 text-3xl text-center tracking-[1.5rem] font-mono rounded-xl"
                      placeholder="••••"
                    />
                  </div>

                  {pinError && (
                    <p className="text-center text-destructive text-sm flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {pinError}
                    </p>
                  )}

                  <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">💡 Tip:</p>
                    <p>Choose a PIN that's easy for {seniorData.preferredName || 'them'} to remember but not too obvious (avoid 1234, birth year, etc.)</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <TactileButton 
                    onClick={() => setStep(1)} 
                    variant="neutral" 
                    className="flex-1"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </TactileButton>
                  <TactileButton 
                    onClick={handleComplete} 
                    disabled={isSubmitting || pin.length !== 4 || confirmPin.length !== 4} 
                    variant="primary" 
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <Check className="w-5 h-5 ml-2" />
                      </>
                    )}
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
