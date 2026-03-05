import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TimeSlotCard, MedicationWithStatus } from '@/components/TimeSlotCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  color: string | null;
  instructions: string | null;
  pill_image_url: string | null;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  status: string;
  scheduled_time: string;
}

const TIME_SLOTS = [
  { key: 'morning', label: 'Subah', icon: '🌅', range: [5, 12] },
  { key: 'afternoon', label: 'Dopahar', icon: '☀️', range: [12, 17] },
  { key: 'evening', label: 'Shaam', icon: '🌇', range: [17, 21] },
  { key: 'night', label: 'Raat', icon: '🌙', range: [21, 29] }, // 29 = 5am next day
];

function getSlotKey(time: string): string {
  const [h] = time.split(':').map(Number);
  for (const slot of TIME_SLOTS) {
    if (h >= slot.range[0] && h < slot.range[1]) return slot.key;
  }
  return 'morning';
}

function SeniorDawaContent() {
  const navigate = useNavigate();
  const { seniorSession } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seniorSession) { navigate('/senior/auth'); return; }
    Promise.all([fetchMedications(), fetchTodayLogs()]).then(() => setLoading(false));
  }, [seniorSession]);

  const fetchMedications = async () => {
    if (!seniorSession) return;
    const { data } = await supabase
      .from('medications')
      .select('*')
      .eq('senior_id', seniorSession.seniorId)
      .eq('is_active', true);
    if (data) {
      setMedications(data.map(m => ({ ...m, times: Array.isArray(m.times) ? (m.times as string[]) : [] })));
    }
  };

  const fetchTodayLogs = async () => {
    if (!seniorSession) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const { data } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('senior_id', seniorSession.seniorId)
      .gte('scheduled_time', today.toISOString())
      .lt('scheduled_time', tomorrow.toISOString());
    if (data) setTodayLogs(data);
  };

  const handleTakeMed = async (med: MedicationWithStatus) => {
    if (!seniorSession || med.taken) return;
    const scheduledTime = new Date();
    const [h, m] = med.time.split(':').map(Number);
    scheduledTime.setHours(h, m, 0, 0);

    const existing = todayLogs.find(
      l => l.medication_id === med.id && new Date(l.scheduled_time).getHours() === h
    );

    if (existing) {
      await supabase.from('medication_logs').update({ status: 'taken', taken_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('medication_logs').insert({
        senior_id: seniorSession.seniorId,
        medication_id: med.id,
        scheduled_time: scheduledTime.toISOString(),
        status: 'taken',
        taken_at: new Date().toISOString(),
      });
    }
    toast.success(`Badhiya! ${med.name} le liya! 💊`);
    fetchTodayLogs();
  };

  // Group meds by time slot
  const slotData = useMemo(() => {
    return TIME_SLOTS.map(slot => {
      const meds: MedicationWithStatus[] = [];
      medications.forEach(med => {
        med.times.forEach(time => {
          if (getSlotKey(time) === slot.key) {
            const [h] = time.split(':').map(Number);
            const log = todayLogs.find(l => l.medication_id === med.id && new Date(l.scheduled_time).getHours() === h);
            meds.push({
              id: med.id, name: med.name, dosage: med.dosage,
              color: med.color, instructions: med.instructions,
              pill_image_url: med.pill_image_url,
              taken: log?.status === 'taken', logId: log?.id, time,
            });
          }
        });
      });
      const allTaken = meds.length > 0 && meds.every(m => m.taken);
      return { ...slot, meds, allTaken };
    }).filter(s => s.meds.length > 0);
  }, [medications, todayLogs]);

  if (!seniorSession) return null;

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="px-6 py-8 bg-gradient-to-b from-primary/10 to-transparent">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/app')} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
        </motion.button>
        <h1 className="text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>💊 Aaj Ki Dawa</h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>Apni sehat ka khayal rakhein</p>
      </header>

      <main className="px-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full mt-2" />
              </div>
            ))}
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">💊</span>
            <p className="text-xl text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Koi dawa nahi mili</p>
            <p className="text-muted-foreground mt-2">Guardian ko batayein dawa add karne ke liye</p>
          </div>
        ) : (
          <div className="space-y-6">
            {slotData.map(slot => (
              <TimeSlotCard
                key={slot.key}
                slot={slot.label}
                icon={slot.icon}
                meds={slot.meds}
                allTaken={slot.allTaken}
                onTakeMed={handleTakeMed}
                onTakeAll={() => {
                  slot.meds.filter(m => !m.taken).forEach(m => handleTakeMed(m));
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SeniorDawa() {
  return (
    <ErrorBoundary>
      <SeniorDawaContent />
    </ErrorBoundary>
  );
}
