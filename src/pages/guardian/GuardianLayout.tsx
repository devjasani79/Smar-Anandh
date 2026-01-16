import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Pill, 
  Heart, 
  Activity, 
  Settings, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GlowIcon } from '@/components/GlowIcon';
import { supabase } from '@/integrations/supabase/client';

interface LinkedSenior {
  id: string;
  name: string;
  photo_url: string | null;
}

export default function GuardianLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, role, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [linkedSeniors, setLinkedSeniors] = useState<LinkedSenior[]>([]);
  const [selectedSenior, setSelectedSenior] = useState<string | null>(null);

  // Redirect if not guardian
  useEffect(() => {
    if (!loading && (!user || role !== 'guardian')) {
      navigate('/auth');
    }
  }, [user, role, loading, navigate]);

  // Fetch linked seniors
  useEffect(() => {
    if (user) {
      fetchLinkedSeniors();
    }
  }, [user]);

  const fetchLinkedSeniors = async () => {
    const { data } = await supabase
      .from('guardian_senior_links')
      .select(`
        senior_id,
        seniors (id, name, photo_url)
      `)
      .eq('guardian_id', user!.id);
    
    if (data) {
      const seniors = data
        .map(link => link.seniors)
        .filter((s): s is LinkedSenior => s !== null);
      setLinkedSeniors(seniors);
      if (seniors.length > 0 && !selectedSenior) {
        setSelectedSenior(seniors[0].id);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/guardian', icon: Home, label: 'Dashboard', exact: true },
    { path: '/guardian/medicines', icon: Pill, label: 'Medicines' },
    { path: '/guardian/joy', icon: Heart, label: 'Joy Activities' },
    { path: '/guardian/vitals', icon: Activity, label: 'Health Vitals' },
    { path: '/guardian/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-card rounded-xl shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-card border-r border-border
          flex flex-col
          transform lg:transform-none transition-transform duration-300
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            🙏 SmarAnandh
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Guardian Dashboard</p>
        </div>

        {/* Senior selector */}
        {linkedSeniors.length > 0 && (
          <div className="p-4 border-b border-border">
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Managing
            </label>
            <select
              value={selectedSenior || ''}
              onChange={(e) => setSelectedSenior(e.target.value)}
              className="w-full p-3 bg-background rounded-lg border border-border text-foreground"
            >
              {linkedSeniors.map((senior) => (
                <option key={senior.id} value={senior.id}>
                  {senior.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive(item.path, item.exact)
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <GlowIcon 
                icon={item.icon} 
                size={20} 
                glowColor={isActive(item.path, item.exact) ? 'primary' : 'muted'} 
              />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">Guardian</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet context={{ selectedSenior, linkedSeniors }} />
        </div>
      </main>
    </div>
  );
}
