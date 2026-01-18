import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MedicineCard } from '@/components/MedicineCard';
import { TactileButton } from '@/components/TactileButton';
import { toast } from 'sonner';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  color: string | null;
  shape: string | null;
  pill_image_url: string | null;
  instructions: string | null;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  status: string;
  scheduled_time: string;
  taken_at: string | null;
}

export default function SeniorDawa() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seniorSession) {
      navigate('/senior/auth');
      return;
    }
    fetchMedications();
    fetchTodayLogs();
  }, [seniorSession, navigate]);

  const fetchMedications = async () => {
    if (!seniorSession) return;
    
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('senior_id', seniorSession.seniorId)
      .eq('is_active', true);

    if (!error && data) {
      setMedications(data.map(m => ({
        ...m,
        times: Array.isArray(m.times) ? (m.times as string[]) : []
      })));
    }
    setLoading(false);
  };

  const fetchTodayLogs = async () => {
    if (!seniorSession) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('senior_id', seniorSession.seniorId)
      .gte('scheduled_time', today.toISOString())
      .lt('scheduled_time', tomorrow.toISOString());

    if (data) {
      setTodayLogs(data);
    }
  };

  const handleTakeMedicine = async (medicationId: string, time: string) => {
    if (!seniorSession) return;

    const scheduledTime = new Date();
    const [hours, minutes] = time.split(':');
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Check if log already exists
    const existingLog = todayLogs.find(
      log => log.medication_id === medicationId && 
             new Date(log.scheduled_time).getHours() === scheduledTime.getHours()
    );

    if (existingLog?.status === 'taken') {
      toast.info('Already marked as taken');
      return;
    }

    if (existingLog) {
      // Update existing log
      await supabase
        .from('medication_logs')
        .update({ 
          status: 'taken', 
          taken_at: new Date().toISOString() 
        })
        .eq('id', existingLog.id);
    } else {
      // Create new log
      await supabase
        .from('medication_logs')
        .insert({
          senior_id: seniorSession.seniorId,
          medication_id: medicationId,
          scheduled_time: scheduledTime.toISOString(),
          status: 'taken',
          taken_at: new Date().toISOString()
        });
    }

    toast.success('Bahut Acche! Dawa le li! 💊');
    fetchTodayLogs();
  };

  const getMedicationStatus = (medicationId: string, time: string) => {
    const scheduledTime = new Date();
    const [hours, minutes] = time.split(':');
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const log = todayLogs.find(
      l => l.medication_id === medicationId && 
           new Date(l.scheduled_time).getHours() === scheduledTime.getHours()
    );

    return log?.status || 'pending';
  };

  if (!seniorSession) return null;

  const currentHour = new Date().getHours();
  
  // Get upcoming medications
  const upcomingMeds = medications.filter(med => 
    med.times.some(time => {
      const [hours] = time.split(':');
      return parseInt(hours) >= currentHour;
    })
  );

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="px-6 py-8 bg-gradient-to-b from-primary/10 to-transparent">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 text-muted-foreground mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
        </motion.button>
        
        <h1 
          className="text-3xl text-foreground"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          💊 Aaj Ki Dawa
        </h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Apni sehat ka khayal rakhein
        </p>
      </header>

      {/* Content */}
      <main className="px-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💊</div>
            <p className="text-xl text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Koi dawa nahi mili
            </p>
            <p className="text-muted-foreground mt-2">
              Guardian ko batayein dawa add karne ke liye
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current time reminder */}
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Abhi {new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })} baj rahe hain
                </p>
                <p className="text-sm text-muted-foreground">
                  {upcomingMeds.length > 0 
                    ? `${upcomingMeds.length} dawa aaj baaki hai`
                    : 'Aaj ki sab dawa ho gayi!'
                  }
                </p>
              </div>
            </div>

            {/* Medication list */}
            <div className="space-y-4">
              {medications.map((med) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-5 shadow-lg border border-border"
                >
                  <div className="flex items-start gap-4">
                    {/* Pill image or color */}
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: med.color || 'hsl(var(--muted))' }}
                    >
                      {med.pill_image_url ? (
                        <img 
                          src={med.pill_image_url} 
                          alt={med.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : '💊'}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {med.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {med.dosage}
                      </p>
                      {med.instructions && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {med.instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {med.times.map((time) => {
                      const status = getMedicationStatus(med.id, time);
                      const isTaken = status === 'taken';
                      
                      return (
                        <TactileButton
                          key={time}
                          onClick={() => !isTaken && handleTakeMedicine(med.id, time)}
                          variant={isTaken ? 'success' : 'neutral'}
                          size="default"
                          disabled={isTaken}
                          className="flex items-center gap-2"
                        >
                          {isTaken && <Check className="w-4 h-4" />}
                          {time}
                          {isTaken ? ' ✓' : ''}
                        </TactileButton>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
