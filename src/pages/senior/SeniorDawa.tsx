import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TimeSlotCard, MedicationWithStatus } from '@/components/TimeSlotCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useMedications, useTodayLogs, useTakeMedication } from '@/hooks/useMedications';
import { useMedicationRealtime, useMedicationsRealtime } from '@/hooks/useMedicationRealtime';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const TIME_SLOTS = [
  { key: 'morning', label: 'Subah', icon: '🌅', range: [5, 12] },
  { key: 'afternoon', label: 'Dopahar', icon: '☀️', range: [12, 17] },
  { key: 'evening', label: 'Shaam', icon: '🌇', range: [17, 21] },
  { key: 'night', label: 'Raat', icon: '🌙', range: [21, 29] },
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
  const reduced = useReducedMotion();
  const seniorId = seniorSession?.seniorId || '';

  // React Query hooks
  const { data: medications = [], isLoading: medsLoading } = useMedications(seniorId);
  const { data: todayLogs = [], isLoading: logsLoading } = useTodayLogs(seniorId);
  const { mutate: takeMed, isPending } = useTakeMedication(seniorId);

  // Realtime subscriptions
  const { connectionStatus } = useMedicationRealtime(seniorId);
  useMedicationsRealtime(seniorId);

  const loading = medsLoading || logsLoading;

  const handleTakeMed = (med: MedicationWithStatus) => {
    if (med.taken || isPending) return;
    takeMed({ id: med.id, time: med.time });
  };

  // Group meds by time slot
  const slotData = useMemo(() => {
    return TIME_SLOTS.map(slot => {
      const meds: MedicationWithStatus[] = [];
      medications.forEach(med => {
        med.times.forEach((time: string) => {
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

  if (!seniorSession) { navigate('/senior/auth'); return null; }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="px-6 py-8 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/app')} className="flex items-center gap-2 text-muted-foreground" aria-label="Wapas jaayein">
            <ArrowLeft className="w-5 h-5" />
            <span style={{ fontFamily: 'Nunito, sans-serif' }}>Wapas</span>
          </motion.button>
          <span className={`text-xs px-2 py-0.5 rounded-full ${connectionStatus === 'connected' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
            {connectionStatus === 'connected' ? '🟢 Live' : '🔴 Offline'}
          </span>
        </div>
        <h1 className="text-3xl text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>💊 Aaj Ki Dawa</h1>
        <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>Apni sehat ka khayal rakhein</p>
      </header>

      <main className="px-6" role="main">
        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading medications">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full mt-2" />
              </div>
            ))}
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-12" role="status">
            <span className="text-6xl block mb-4" aria-hidden="true">💊</span>
            <p className="text-xl text-muted-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Koi dawa nahi mili</p>
            <p className="text-muted-foreground mt-2">Guardian ko batayein dawa add karne ke liye</p>
          </div>
        ) : (
          <div className="space-y-6" role="list" aria-label="Medication time slots">
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
