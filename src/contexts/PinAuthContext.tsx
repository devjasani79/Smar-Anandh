import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SeniorSession {
  seniorId: string;
  seniorName: string;
  preferredName: string | null;
  photoUrl: string | null;
  guardianId: string | null;
  role: 'senior' | 'guardian';
}

interface PinAuthContextType {
  session: SeniorSession | null;
  isLoading: boolean;
  validatePin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  setRole: (role: 'senior' | 'guardian') => void;
  logout: () => void;
}

const PinAuthContext = createContext<PinAuthContextType | undefined>(undefined);

const SESSION_KEY = 'smaranandh_session';

export function PinAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SeniorSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Persist session to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const validatePin = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return { success: false, error: 'PIN must be 4 digits' };
    }

    try {
      const { data, error } = await supabase.rpc('validate_family_pin', { input_pin: pin });

      if (error) {
        console.error('PIN validation error:', error);
        return { success: false, error: 'Unable to validate PIN' };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Invalid PIN. Please try again.' };
      }

      const result = data[0];
      
      setSession({
        seniorId: result.senior_id,
        seniorName: result.senior_name,
        preferredName: result.preferred_name,
        photoUrl: result.photo_url,
        guardianId: result.guardian_id,
        role: result.guardian_id ? 'guardian' : 'senior', // Default to guardian if link exists
      });

      return { success: true };
    } catch (err) {
      console.error('PIN validation exception:', err);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  };

  const setRole = (role: 'senior' | 'guardian') => {
    if (session) {
      setSession({ ...session, role });
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <PinAuthContext.Provider value={{ session, isLoading, validatePin, setRole, logout }}>
      {children}
    </PinAuthContext.Provider>
  );
}

export function usePinAuth() {
  const context = useContext(PinAuthContext);
  if (context === undefined) {
    throw new Error('usePinAuth must be used within a PinAuthProvider');
  }
  return context;
}
