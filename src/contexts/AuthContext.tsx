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
  // Guardian auth state
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  guardianProfile: GuardianProfile | null;
  linkedSeniors: LinkedSenior[];
  
  // Session mode (for switching between guardian/senior views)
  sessionMode: SessionMode;
  seniorSession: SeniorSession | null;
  
  // Guardian auth methods
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  
  // Senior mode methods
  enterSeniorMode: (pin: string, selectedSeniorId?: string) => Promise<{ success: boolean; error?: string }>;
  exitSeniorMode: () => void;
  
  // Dual-key auth for standalone senior access (phone + PIN)
  validateDualKey: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  
  // Senior management
  refreshLinkedSeniors: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_MODE_KEY = 'smaranandh_session_mode';
const SENIOR_SESSION_KEY = 'smaranandh_senior_session';

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
    
    if (storedMode) {
      setSessionMode(storedMode);
    }
    if (storedSeniorSession) {
      try {
        setSeniorSession(JSON.parse(storedSeniorSession));
      } catch {
        localStorage.removeItem(SENIOR_SESSION_KEY);
      }
    }
  }, []);

  // Persist session mode
  useEffect(() => {
    if (sessionMode) {
      localStorage.setItem(SESSION_MODE_KEY, sessionMode);
    } else {
      localStorage.removeItem(SESSION_MODE_KEY);
    }
  }, [sessionMode]);

  // Persist senior session
  useEffect(() => {
    if (seniorSession) {
      localStorage.setItem(SENIOR_SESSION_KEY, JSON.stringify(seniorSession));
    } else {
      localStorage.removeItem(SENIOR_SESSION_KEY);
    }
  }, [seniorSession]);

  const fetchGuardianProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data && user?.email) {
      setGuardianProfile({
        id: data.id,
        fullName: data.full_name,
        phone: data.phone,
        email: user.email
      });
    }
  }, [user?.email]);

  const fetchUserRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setRole(data.role);
    }
  }, []);

  const refreshLinkedSeniors = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase.rpc('get_guardian_seniors', { 
      guardian_user_id: user.id 
    });
    
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
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
            fetchGuardianProfile(currentSession.user.id);
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchUserRole(existingSession.user.id);
        fetchGuardianProfile(existingSession.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole, fetchGuardianProfile]);

  // Fetch linked seniors when user is authenticated and is a guardian
  useEffect(() => {
    if (user && role === 'guardian') {
      refreshLinkedSeniors();
    }
  }, [user, role, refreshLinkedSeniors]);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const redirectUrl = `${window.location.origin}/guardian`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    });

    if (error) return { error };

    if (data.user) {
      // Create profile with phone
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        full_name: fullName,
        phone: phone
      });

      // Assign guardian role
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'guardian' as AppRole
      });
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      setSessionMode('guardian');
    }
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

    // Find matching senior from linked seniors
    const targetSenior = selectedSeniorId 
      ? linkedSeniors.find(s => s.id === selectedSeniorId)
      : linkedSeniors.find(s => s.isPrimary) || linkedSeniors[0];

    if (!targetSenior) {
      return { success: false, error: 'No senior linked to this account' };
    }

    // Validate PIN against the senior's family_pin
    const { data, error } = await supabase
      .from('seniors')
      .select('id, family_pin')
      .eq('id', targetSenior.id)
      .single();

    if (error || !data) {
      return { success: false, error: 'Unable to validate PIN' };
    }

    if (data.family_pin !== pin) {
      return { success: false, error: 'Invalid PIN. Please try again.' };
    }

    // Set senior session
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

    if (!phone || phone.length < 10) {
      return { success: false, error: 'Please enter a valid phone number' };
    }

    try {
      const { data, error } = await supabase.rpc('validate_family_pin_with_phone', {
        guardian_phone: phone,
        input_pin: pin
      });

      if (error) {
        console.error('Dual-key validation error:', error);
        return { success: false, error: 'Unable to validate credentials' };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Invalid phone number or PIN' };
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
      user,
      session,
      loading,
      role,
      guardianProfile,
      linkedSeniors,
      sessionMode,
      seniorSession,
      signUp,
      signIn,
      signOut,
      resetPassword,
      enterSeniorMode,
      exitSeniorMode,
      validateDualKey,
      refreshLinkedSeniors
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
