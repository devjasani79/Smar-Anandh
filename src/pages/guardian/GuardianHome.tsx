import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Pill, 
  Activity as ActivityIcon, 
  Clock,
  CheckCircle,
  AlertCircle,
  Music,
  Eye,
  Image,
  Gamepad2,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GlowIcon } from '@/components/GlowIcon';
import { format } from 'date-fns';
import { TactileButton } from '@/components/TactileButton';

interface ContextType {
  selectedSenior: string | null;
  linkedSeniors: { id: string; name: string; photo_url: string | null }[];
}

interface ActivityLog {
  id: string;
  activity_type: string;
  activity_data: Record<string, unknown>;
  logged_at: string;
}

interface MedicationLog {
  id: string;
  status: string;
  scheduled_time: string;
  taken_at: string | null;
  medications: {
    name: string;
    dosage: string;
  };
}

interface HealthVital {
  id: string;
  vital_type: string;
  value: number;
  unit: string;
  recorded_at: string;
}

export default function GuardianHome() {
  const navigate = useNavigate();
  const { selectedSenior, linkedSeniors } = useOutletContext<ContextType>();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [healthVitals, setHealthVitals] = useState<HealthVital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedSenior) {
      fetchData();
      subscribeToRealtime();
    }
  }, [selectedSenior]);

  const fetchData = async () => {
    if (!selectedSenior) return;
    
    setLoading(true);
    
    // Fetch activity logs
    const { data: activities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('senior_id', selectedSenior)
      .order('logged_at', { ascending: false })
      .limit(20);
    
    if (activities) {
      setActivityLogs(activities as ActivityLog[]);
    }

    // Fetch medication logs for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: meds } = await supabase
      .from('medication_logs')
      .select(`
        id, status, scheduled_time, taken_at,
        medications (name, dosage)
      `)
      .eq('senior_id', selectedSenior)
      .gte('scheduled_time', today.toISOString())
      .order('scheduled_time', { ascending: true });
    
    if (meds) {
      setMedicationLogs(meds as unknown as MedicationLog[]);
    }

    // Fetch latest health vitals
    const { data: vitals } = await supabase
      .from('health_vitals')
      .select('*')
      .eq('senior_id', selectedSenior)
      .order('recorded_at', { ascending: false })
      .limit(5);
    
    if (vitals) {
      setHealthVitals(vitals);
    }

    setLoading(false);
  };

  const subscribeToRealtime = () => {
    const channel = supabase
      .channel('guardian-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
          filter: `senior_id=eq.${selectedSenior}`
        },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medication_logs',
          filter: `senior_id=eq.${selectedSenior}`
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'medicine_taken': return <Pill className="w-5 h-5 text-success" />;
      case 'music_played': return <Music className="w-5 h-5 text-primary" />;
      case 'video_watched': return <Eye className="w-5 h-5 text-primary" />;
      case 'photos_viewed': return <Image className="w-5 h-5 text-primary" />;
      case 'game_played': return <Gamepad2 className="w-5 h-5 text-primary" />;
      case 'sos_triggered': return <AlertCircle className="w-5 h-5 text-destructive" />;
      default: return <ActivityIcon className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActivityLabel = (type: string, data: Record<string, unknown>) => {
    switch (type) {
      case 'medicine_taken': return `${data.medicine_name || 'Medicine'} taken`;
      case 'music_played': return `Listened to ${data.duration || ''} mins of music`;
      case 'video_watched': return `Watched video for ${data.duration || ''} mins`;
      case 'photos_viewed': return 'Viewed family photos';
      case 'game_played': return 'Played brain games';
      case 'sos_triggered': return 'SOS Alert triggered!';
      case 'app_opened': return 'Opened the app';
      default: return type.replace(/_/g, ' ');
    }
  };

  const selectedSeniorData = linkedSeniors.find(s => s.id === selectedSenior);

  if (!selectedSenior || linkedSeniors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          No Seniors Linked
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          You haven't linked any seniors yet. Add a senior to start monitoring their health and activities.
        </p>
        <TactileButton
          variant="primary"
          onClick={() => navigate('/guardian/settings')}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Senior
        </TactileButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Improved layout */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Senior Photo */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {selectedSeniorData?.photo_url ? (
                <img 
                  src={selectedSeniorData.photo_url} 
                  alt={selectedSeniorData.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                {selectedSeniorData?.name}'s Dashboard
              </h1>
              <p className="text-muted-foreground text-sm">
                Real-time monitoring & care management
              </p>
            </div>
          </div>
          <TactileButton
            variant="primary"
            size="default"
            onClick={() => navigate('/guardian/medicines')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Medicine
          </TactileButton>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-warm p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
              <GlowIcon icon={CheckCircle} size={24} glowColor="success" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">Medicines Today</p>
              <p className="text-2xl font-bold text-foreground">
                {medicationLogs.filter(m => m.status === 'taken').length}/{medicationLogs.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-warm p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <GlowIcon icon={ActivityIcon} size={24} glowColor="primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">Activities Today</p>
              <p className="text-2xl font-bold text-foreground">
                {activityLogs.filter(a => {
                  const logDate = new Date(a.logged_at);
                  const today = new Date();
                  return logDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-warm p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">Last Active</p>
              <p className="text-lg font-bold text-foreground truncate">
                {activityLogs.length > 0 
                  ? format(new Date(activityLogs[0].logged_at), 'h:mm a')
                  : 'No activity'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card-warm"
        >
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-primary" />
              Live Activity Feed
            </h2>
          </div>
          <div className="p-5 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities recorded yet
              </div>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(log.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {getActivityLabel(log.activity_type, log.activity_data)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.logged_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Health Vitals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-warm"
        >
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-success" />
              Health Vitals
            </h2>
          </div>
          <div className="p-5">
            {healthVitals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No vitals recorded yet
              </div>
            ) : (
              <div className="space-y-3">
                {healthVitals.map((vital) => (
                  <div
                    key={vital.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground capitalize text-sm truncate">
                        {vital.vital_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(vital.recorded_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-foreground">
                        {vital.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{vital.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Today's Medications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-warm"
      >
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            Today's Medications
          </h2>
        </div>
        <div className="p-5">
          {medicationLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medications scheduled for today
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicationLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border-2 ${
                    log.status === 'taken'
                      ? 'border-success bg-success/10'
                      : log.status === 'missed'
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.scheduled_time), 'h:mm a')}
                    </span>
                    {log.status === 'taken' ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : log.status === 'missed' ? (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="font-medium text-foreground">
                    {log.medications?.name || 'Medicine'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {log.medications?.dosage}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
