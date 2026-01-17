import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinPad } from '@/components/PinPad';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { usePinAuth } from '@/contexts/PinAuthContext';

export default function PinAuth() {
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading, validatePin, setRole } = usePinAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // If already authenticated, check if we need role selection
  useEffect(() => {
    if (session && !sessionLoading) {
      // If guardian is linked, show role switcher
      if (session.guardianId) {
        setShowRoleSwitcher(true);
      } else {
        // No guardian, go directly to senior app
        navigate('/app');
      }
    }
  }, [session, sessionLoading, navigate]);

  const handlePinSubmit = async (pin: string) => {
    setIsValidating(true);
    setError('');

    const result = await validatePin(pin);

    if (!result.success) {
      setError(result.error || 'Invalid PIN');
    }
    // If success, the useEffect will handle navigation

    setIsValidating(false);
  };

  const handleSelectSenior = () => {
    setRole('senior');
    navigate('/app');
  };

  const handleSelectGuardian = () => {
    setRole('guardian');
    navigate('/guardian');
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showRoleSwitcher && session) {
    return (
      <RoleSwitcher
        preferredName={session.preferredName}
        seniorName={session.seniorName}
        onSelectSenior={handleSelectSenior}
        onSelectGuardian={handleSelectGuardian}
      />
    );
  }

  return (
    <PinPad
      onSubmit={handlePinSubmit}
      isLoading={isValidating}
      error={error}
      title="SmarAnandh"
      subtitle="Enter your Family PIN"
    />
  );
}
