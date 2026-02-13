import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface GuardianProfile {
  id: string;
  fullName: string;
  phone: string | null;
  email: string;
}

interface LinkedSenior {
  id: string;
  name: string;
  preferredName: string | null;
  photoUrl: string | null;
  language: string | null;
  isPrimary: boolean;
}

interface SeniorSession {
  seniorId: string;
  seniorName: string;
  preferredName: string | null;
  photoUrl: string | null;
  language: string | null;
  guardianId: string;
}

type SessionMode = 'guardian' | 'senior' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  guardianProfile: GuardianProfile | null;
  linkedSeniors: LinkedSenior[];
  sessionMode: SessionMode;
  seniorSession: SeniorSession | null;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  enterSeniorMode: (pin: string, selectedSeniorId?: string) => Promise<{ success: boolean; error?: string }>;
  exitSeniorMode: () => void;
  validateDualKey: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  refreshLinkedSeniors: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_MODE_KEY = 'smaranandh_session_mode';
const SENIOR_SESSION_KEY = 'smaranandh_senior_session';

// Normalize phone: strip everything except digits, remove leading 91 if 12+ digits
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length >= 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [guardianProfile, setGuardianProfile] = useState<GuardianProfile | null>(null);
  const [linkedSeniors, setLinkedSeniors] = useState<LinkedSenior[]>([]);
  const [sessionMode, setSessionMode] = useState<SessionMode>(null);
  const [seniorSession, setSeniorSession] = useState<SeniorSession | null>(null);

  // Restore session mode from localStorage
  useEffect(() => {
    const storedMode = localStorage.getItem(SESSION_MODE_KEY) as SessionMode;
    const storedSeniorSession = localStorage.getItem(SENIOR_SESSION_KEY);
    if (storedMode) setSessionMode(storedMode);
    if (storedSeniorSession) {
      try { setSeniorSession(JSON.parse(storedSeniorSession)); } catch { localStorage.removeItem(SENIOR_SESSION_KEY); }
    }
  }, []);

  useEffect(() => {
    if (sessionMode) localStorage.setItem(SESSION_MODE_KEY, sessionMode);
    else localStorage.removeItem(SESSION_MODE_KEY);
  }, [sessionMode]);

  useEffect(() => {
    if (seniorSession) localStorage.setItem(SENIOR_SESSION_KEY, JSON.stringify(seniorSession));
    else localStorage.removeItem(SENIOR_SESSION_KEY);
  }, [seniorSession]);

  const fetchGuardianProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data) {
        setGuardianProfile({
          id: data.id,
          fullName: data.full_name,
          phone: data.phone,
          email: email || ''
        });
      }
    } catch (err) {
      console.error('Error fetching guardian profile:', err);
    }
  }, []);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      if (data) setRole(data.role);
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  }, []);

  const refreshLinkedSeniors = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.rpc('get_guardian_seniors', { guardian_user_id: user.id });
      if (data) {
        setLinkedSeniors(data.map(s => ({
          id: s.senior_id,
          name: s.senior_name,
          preferredName: s.preferred_name,
          photoUrl: s.photo_url,
          language: s.language,
          isPrimary: s.is_primary || false
        })));
      }
    } catch (err) {
      console.error('Error fetching linked seniors:', err);
    }
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
            fetchGuardianProfile(currentSession.user.id, currentSession.user.email);
          }, 0);
        } else {
          setRole(null);
          setGuardianProfile(null);
          setLinkedSeniors([]);
          setSessionMode(null);
          setSeniorSession(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchUserRole(existingSession.user.id);
        fetchGuardianProfile(existingSession.user.id, existingSession.user.email);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole, fetchGuardianProfile]);

  useEffect(() => {
    if (user && role === 'guardian') {
      refreshLinkedSeniors();
    }
  }, [user, role, refreshLinkedSeniors]);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/guardian`,
          data: { full_name: fullName }
        }
      });

      if (error) return { error };
      if (!data.user) return { error: new Error('Signup failed - no user returned') };

      // Create profile - use upsert to handle race conditions
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: data.user.id,
        full_name: fullName,
        phone: normalizePhone(phone)
      }, { onConflict: 'user_id' });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Non-fatal: continue even if profile creation has issues
      }

      // Assign guardian role - check first, then insert
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('role', 'guardian')
        .maybeSingle();

      if (!existingRole) {
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'guardian' as AppRole
        });
        if (roleError) console.error('Role assignment error:', roleError);
      }

      return { error: null };
    } catch (err: any) {
      console.error('SignUp exception:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setSessionMode('guardian');
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setGuardianProfile(null);
    setLinkedSeniors([]);
    setSessionMode(null);
    setSeniorSession(null);
    localStorage.removeItem(SESSION_MODE_KEY);
    localStorage.removeItem(SENIOR_SESSION_KEY);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    return { error };
  };

  const enterSeniorMode = async (pin: string, selectedSeniorId?: string): Promise<{ success: boolean; error?: string }> => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return { success: false, error: 'PIN must be 4 digits' };
    }

    const targetSenior = selectedSeniorId 
      ? linkedSeniors.find(s => s.id === selectedSeniorId)
      : linkedSeniors.find(s => s.isPrimary) || linkedSeniors[0];

    if (!targetSenior) {
      return { success: false, error: 'No senior linked to this account' };
    }

    try {
      const { data, error } = await supabase
        .from('seniors')
        .select('id, family_pin')
        .eq('id', targetSenior.id)
        .single();

      if (error || !data) return { success: false, error: 'Unable to validate PIN' };
      if (data.family_pin !== pin) return { success: false, error: 'Invalid PIN. Please try again.' };

      setSeniorSession({
        seniorId: targetSenior.id,
        seniorName: targetSenior.name,
        preferredName: targetSenior.preferredName,
        photoUrl: targetSenior.photoUrl,
        language: targetSenior.language,
        guardianId: user!.id
      });
      setSessionMode('senior');
      return { success: true };
    } catch {
      return { success: false, error: 'Something went wrong' };
    }
  };

  const exitSeniorMode = () => {
    setSessionMode('guardian');
    setSeniorSession(null);
    localStorage.removeItem(SENIOR_SESSION_KEY);
  };

  const validateDualKey = async (phone: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return { success: false, error: 'PIN must be 4 digits' };
    }
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      return { success: false, error: 'Please enter a valid phone number' };
    }

    try {
      // Normalize the phone for the RPC call
      const normalizedPhone = normalizePhone(phone);
      
      const { data, error } = await supabase.rpc('validate_family_pin_with_phone', {
        guardian_phone: normalizedPhone,
        input_pin: pin
      });

      if (error) {
        console.error('Dual-key validation error:', error);
        return { success: false, error: 'Unable to validate credentials' };
      }

      if (!data || data.length === 0) {
        // Try with the raw phone too in case stored format differs
        const { data: data2, error: error2 } = await supabase.rpc('validate_family_pin_with_phone', {
          guardian_phone: phone.trim(),
          input_pin: pin
        });

        if (error2 || !data2 || data2.length === 0) {
          return { success: false, error: 'Phone number ya PIN galat hai. Guardian ka registered number use karein.' };
        }

        const result = data2[0];
        setSeniorSession({
          seniorId: result.senior_id,
          seniorName: result.senior_name,
          preferredName: result.preferred_name,
          photoUrl: result.photo_url,
          language: result.senior_language,
          guardianId: result.guardian_id
        });
        setSessionMode('senior');
        return { success: true };
      }

      const result = data[0];
      setSeniorSession({
        seniorId: result.senior_id,
        seniorName: result.senior_name,
        preferredName: result.preferred_name,
        photoUrl: result.photo_url,
        language: result.senior_language,
        guardianId: result.guardian_id
      });
      setSessionMode('senior');
      return { success: true };
    } catch (err) {
      console.error('Dual-key validation exception:', err);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading, role, guardianProfile, linkedSeniors,
      sessionMode, seniorSession,
      signUp, signIn, signOut, resetPassword,
      enterSeniorMode, exitSeniorMode, validateDualKey, refreshLinkedSeniors
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
