import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TactileButton } from '@/components/TactileButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const navigate = useNavigate();
  const { user, signUp, signIn, loading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'guardian' | 'senior'>('guardian');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
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
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          setSubmitting(false);
          return;
        }
        
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please login instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully!');
          navigate('/');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-8 text-center"
      >
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          🙏 SmarAnandh
        </h1>
        <p className="text-body text-muted-foreground">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </p>
      </motion.header>

      {/* Form */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-6 pb-8"
      >
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role selection (signup only) */}
            {!isLogin && (
              <div className="space-y-3">
                <Label className="text-label">I am a...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole('guardian')}
                    className={`card-warm p-4 flex flex-col items-center gap-2 transition-all ${
                      role === 'guardian' ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <Shield className="w-8 h-8 text-primary" />
                    <span className="text-body font-semibold">Guardian</span>
                    <span className="text-sm text-muted-foreground">Care for seniors</span>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole('senior')}
                    className={`card-warm p-4 flex flex-col items-center gap-2 transition-all ${
                      role === 'senior' ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <User className="w-8 h-8 text-success" />
                    <span className="text-body font-semibold">Senior</span>
                    <span className="text-sm text-muted-foreground">Use the app</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Full name (signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-label">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-14 text-lg rounded-xl"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-label">
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

            {/* Password */}
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

            {/* Submit button */}
            <TactileButton
              type="submit"
              variant="primary"
              size="large"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </TactileButton>
          </form>

          {/* Toggle login/signup */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-body text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
