import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Music, 
  Video, 
  Image, 
  Gamepad2,
  Sparkles,
  ExternalLink,
  Save,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TactileButton } from '@/components/TactileButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface ContextType {
  selectedSenior: string | null;
}

interface JoyPreferences {
  suno_config: { enabled: boolean; type: string; playlist_url?: string };
  dekho_config: { enabled: boolean; channel_url?: string };
  yaadein_config: { enabled: boolean; album_url?: string };
  khel_config: { enabled: boolean };
  ai_suggestions_enabled: boolean;
}

const defaultPreferences: JoyPreferences = {
  suno_config: { enabled: true, type: 'bhajans' },
  dekho_config: { enabled: true, channel_url: '' },
  yaadein_config: { enabled: true, album_url: '' },
  khel_config: { enabled: true },
  ai_suggestions_enabled: true,
};

export default function GuardianJoy() {
  const { selectedSenior } = useOutletContext<ContextType>();
  const [preferences, setPreferences] = useState<JoyPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedSenior) {
      fetchPreferences();
    }
  }, [selectedSenior]);

  const fetchPreferences = async () => {
    if (!selectedSenior) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('joy_preferences')
      .select('*')
      .eq('senior_id', selectedSenior)
      .maybeSingle();
    
    if (data) {
      setPreferences({
        suno_config: data.suno_config as JoyPreferences['suno_config'] || defaultPreferences.suno_config,
        dekho_config: data.dekho_config as JoyPreferences['dekho_config'] || defaultPreferences.dekho_config,
        yaadein_config: data.yaadein_config as JoyPreferences['yaadein_config'] || defaultPreferences.yaadein_config,
        khel_config: data.khel_config as JoyPreferences['khel_config'] || defaultPreferences.khel_config,
        ai_suggestions_enabled: data.ai_suggestions_enabled ?? true,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedSenior) return;
    
    setSaving(true);
    
    const { data: existing } = await supabase
      .from('joy_preferences')
      .select('id')
      .eq('senior_id', selectedSenior)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('joy_preferences')
        .update({
          suno_config: preferences.suno_config,
          dekho_config: preferences.dekho_config,
          yaadein_config: preferences.yaadein_config,
          khel_config: preferences.khel_config,
          ai_suggestions_enabled: preferences.ai_suggestions_enabled,
        })
        .eq('senior_id', selectedSenior);

      if (error) {
        toast.error('Failed to save preferences');
      } else {
        toast.success('Preferences saved!');
      }
    } else {
      const { error } = await supabase
        .from('joy_preferences')
        .insert({
          senior_id: selectedSenior,
          suno_config: preferences.suno_config,
          dekho_config: preferences.dekho_config,
          yaadein_config: preferences.yaadein_config,
          khel_config: preferences.khel_config,
          ai_suggestions_enabled: preferences.ai_suggestions_enabled,
        });

      if (error) {
        toast.error('Failed to save preferences');
      } else {
        toast.success('Preferences saved!');
      }
    }
    
    setSaving(false);
  };

  if (!selectedSenior) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Please select a senior to manage their joy activities.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Joy Activities
          </h1>
          <p className="text-muted-foreground">
            Configure entertainment and happiness activities
          </p>
        </div>
        <TactileButton
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save Changes
        </TactileButton>
      </motion.div>

      {/* AI Suggestions Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-warm p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized daily activity suggestions
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.ai_suggestions_enabled}
            onCheckedChange={(checked) => 
              setPreferences(prev => ({ ...prev, ai_suggestions_enabled: checked }))
            }
          />
        </div>
      </motion.div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SUNO - Listen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-warm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Music className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">🎵 SUNO (Listen)</h3>
                <p className="text-sm text-muted-foreground">Music & audio content</p>
              </div>
            </div>
            <Switch
              checked={preferences.suno_config.enabled}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({
                  ...prev,
                  suno_config: { ...prev.suno_config, enabled: checked }
                }))
              }
            />
          </div>

          {preferences.suno_config.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <select
                  value={preferences.suno_config.type}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    suno_config: { ...prev.suno_config, type: e.target.value }
                  }))}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background"
                >
                  <option value="bhajans">Bhajans (Devotional)</option>
                  <option value="oldies">Old Bollywood Songs</option>
                  <option value="classical">Classical Music</option>
                  <option value="gurbani">Gurbani</option>
                  <option value="quran">Quran Verses</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Custom Playlist URL (Spotify/YouTube)</Label>
                <Input
                  value={preferences.suno_config.playlist_url || ''}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    suno_config: { ...prev.suno_config, playlist_url: e.target.value }
                  }))}
                  placeholder="https://youtube.com/playlist?list=..."
                  className="h-12"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* DEKHO - Watch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-warm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">👁️ DEKHO (Watch)</h3>
                <p className="text-sm text-muted-foreground">Video content</p>
              </div>
            </div>
            <Switch
              checked={preferences.dekho_config.enabled}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({
                  ...prev,
                  dekho_config: { ...prev.dekho_config, enabled: checked }
                }))
              }
            />
          </div>

          {preferences.dekho_config.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>YouTube Channel URL</Label>
                <Input
                  value={preferences.dekho_config.channel_url || ''}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    dekho_config: { ...prev.dekho_config, channel_url: e.target.value }
                  }))}
                  placeholder="https://youtube.com/@channel"
                  className="h-12"
                />
              </div>
              <a
                href="https://www.youtube.com/results?search_query=relaxing+indian+nature"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Browse calming videos
              </a>
            </div>
          )}
        </motion.div>

        {/* YAADEIN - Memories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-warm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Image className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">🖼️ YAADEIN (Memories)</h3>
                <p className="text-sm text-muted-foreground">Family photo albums</p>
              </div>
            </div>
            <Switch
              checked={preferences.yaadein_config.enabled}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({
                  ...prev,
                  yaadein_config: { ...prev.yaadein_config, enabled: checked }
                }))
              }
            />
          </div>

          {preferences.yaadein_config.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Google Photos Album URL</Label>
                <Input
                  value={preferences.yaadein_config.album_url || ''}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    yaadein_config: { ...prev.yaadein_config, album_url: e.target.value }
                  }))}
                  placeholder="https://photos.google.com/share/..."
                  className="h-12"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Share a Google Photos album for automatic slideshow
              </p>
            </div>
          )}
        </motion.div>

        {/* KHEL - Play */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-warm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">🧩 KHEL (Play)</h3>
                <p className="text-sm text-muted-foreground">Brain games & activities</p>
              </div>
            </div>
            <Switch
              checked={preferences.khel_config.enabled}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({
                  ...prev,
                  khel_config: { ...prev.khel_config, enabled: checked }
                }))
              }
            />
          </div>

          {preferences.khel_config.enabled && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Includes:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Word of the Day puzzles
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Picture trivia games
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Micro-moment activities (e.g., "Feed the birds")
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Recipe recording prompts
                </li>
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
