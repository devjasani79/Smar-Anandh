import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Phone, Mail, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TactileButton } from '@/components/TactileButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().min(10, 'Please enter a valid phone number');

export default function GuardianAuth() {
  const navigate = useNavigate();
  const { user, loading, linkedSeniors, signUp, signIn, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track if we've already handled redirect to prevent loops
  const hasRedirected = useRef(false);

  // Redirect if already logged in - only once
  useEffect(() => {
    if (!loading && user && !hasRedirected.current) {
      hasRedirected.current = true;
      // Check if user has linked seniors - if not, send to onboarding
      if (linkedSeniors.length === 0) {
        navigate('/guardian/onboarding', { replace: true });
      } else {
        navigate('/guardian', { replace: true });
      }
    }
  }, [user, loading, linkedSeniors.length, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    if (mode !== 'forgot') {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Please enter your full name';
      }
      try {
        phoneSchema.parse(phone);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.phone = e.errors[0].message;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          // Navigation will be handled by useEffect when user state updates
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName, phone);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please login instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Please complete your setup.');
          hasRedirected.current = true;
          navigate('/guardian/onboarding', { replace: true });
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Password reset email sent! Check your inbox.');
          setMode('login');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is logged in, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-8"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Back to home</span>
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Guardian Portal
            </h1>
            <p className="text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Form */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-6 pb-8"
      >
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name (signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-label flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`h-14 text-lg rounded-xl ${errors.fullName ? 'border-destructive' : ''}`}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            {/* Phone (signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-label flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className={`h-14 text-lg rounded-xl ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This will be used for senior device login (Phone + PIN)
                </p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-label flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`h-14 text-lg rounded-xl ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password (not for forgot mode) */}
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-label">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`h-14 text-lg rounded-xl pr-12 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            {/* Forgot password link (login only) */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:underline"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <TactileButton
              type="submit"
              variant="primary"
              size="large"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Please wait...' : 
                mode === 'login' ? 'Login' : 
                mode === 'signup' ? 'Create Account' : 
                'Send Reset Link'}
            </TactileButton>
          </form>

          {/* Mode toggles */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-body text-primary hover:underline"
              >
                Back to login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErrors({});
                }}
                className="text-body text-primary hover:underline"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            )}
          </div>

          {/* Senior access link */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Are you a senior using the companion app?
            </p>
            <Link
              to="/senior/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-success/10 text-success rounded-xl font-semibold hover:bg-success/20 transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              <span className="text-xl">🙏</span>
              Enter Senior Mode
            </Link>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
