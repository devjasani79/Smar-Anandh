import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User,
  Plus,
  Trash2,
  Camera,
  Save,
  Phone,
  Loader2,
  AlertCircle,
  Bell,
  LogOut,
  Shield,
  UserX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TactileButton } from '@/components/TactileButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ContextType {
  selectedSenior: string | null;
  linkedSeniors: { id: string; name: string; photo_url: string | null }[];
}

interface SeniorDetails {
  id: string;
  name: string;
  photo_url: string | null;
  language: string;
  chronic_conditions: string[];
  nudge_frequency: string;
  emergency_contacts: { name: string; phone: string; relationship: string }[];
  family_pin: string | null;
}

export default function GuardianSettings() {
  const navigate = useNavigate();
  const { user, signOut, refreshLinkedSeniors, guardianProfile } = useAuth();
  const { selectedSenior, linkedSeniors } = useOutletContext<ContextType>();
  const [senior, setSenior] = useState<SeniorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddSenior, setShowAddSenior] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<'senior' | 'account' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Guardian profile editing
  const [editingGuardian, setEditingGuardian] = useState(false);
  const [savingGuardian, setSavingGuardian] = useState(false);
  const [guardianForm, setGuardianForm] = useState({
    fullName: guardianProfile?.fullName || '',
    phone: guardianProfile?.phone || '',
  });

  // Update guardian form when profile loads
  useEffect(() => {
    if (guardianProfile) {
      setGuardianForm({
        fullName: guardianProfile.fullName || '',
        phone: guardianProfile.phone || '',
      });
    }
  }, [guardianProfile]);

  // New senior form
  const [newSeniorForm, setNewSeniorForm] = useState({
    name: '',
    language: 'hinglish',
    chronicConditions: '',
    familyPin: '',
    emergencyContacts: [{ name: '', phone: '', relationship: '' }],
  });

  useEffect(() => {
    if (selectedSenior) {
      fetchSeniorDetails();
    } else {
      setLoading(false);
    }
  }, [selectedSenior]);

  // Helper function to normalize emergency_contacts to array format
  const normalizeEmergencyContacts = (contacts: any): { name: string; phone: string; relationship: string }[] => {
    if (!contacts) return [];
    
    // If it's already an array, return it
    if (Array.isArray(contacts)) {
      return contacts.map(c => ({
        name: c.name || '',
        phone: c.phone || '',
        relationship: c.relationship || ''
      }));
    }
    
    // If it's an object with 'primary' key (old format), convert to array
    if (typeof contacts === 'object' && contacts.primary) {
      return [{
        name: contacts.primary.name || '',
        phone: contacts.primary.phone || '',
        relationship: contacts.primary.relationship || 'Primary'
      }];
    }
    
    // If it's an object without 'primary', try to extract values
    if (typeof contacts === 'object') {
      return Object.values(contacts).map((c: any) => ({
        name: c.name || '',
        phone: c.phone || '',
        relationship: c.relationship || ''
      }));
    }
    
    return [];
  };

  const fetchSeniorDetails = async () => {
    if (!selectedSenior) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('seniors')
      .select('*')
      .eq('id', selectedSenior)
      .maybeSingle();
    
    if (data) {
      setSenior({
        ...data,
        chronic_conditions: data.chronic_conditions || [],
        emergency_contacts: normalizeEmergencyContacts(data.emergency_contacts),
        family_pin: data.family_pin,
      });
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!selectedSenior) return;

    const fileName = `${selectedSenior}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('senior-photos')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Failed to upload photo');
      return;
    }

    const { data: urlData } = supabase.storage
      .from('senior-photos')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('seniors')
      .update({ photo_url: urlData.publicUrl })
      .eq('id', selectedSenior);

    if (updateError) {
      toast.error('Failed to update photo');
    } else {
      toast.success('Photo updated!');
      fetchSeniorDetails();
    }
  };

  const handleSaveSenior = async () => {
    if (!senior) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('seniors')
      .update({
        name: senior.name,
        language: senior.language,
        chronic_conditions: senior.chronic_conditions,
        nudge_frequency: senior.nudge_frequency,
        emergency_contacts: senior.emergency_contacts,
        family_pin: senior.family_pin,
      })
      .eq('id', senior.id);

    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Settings saved!');
      await refreshLinkedSeniors();
    }
    setSaving(false);
  };

  const handleAddNewSenior = async () => {
    if (!user || !newSeniorForm.name) {
      toast.error('Please enter a name');
      return;
    }

    if (!newSeniorForm.familyPin || newSeniorForm.familyPin.length !== 4) {
      toast.error('Please enter a 4-digit Family PIN');
      return;
    }

    setSaving(true);

    // Create senior
    const { data: newSenior, error: seniorError } = await supabase
      .from('seniors')
      .insert({
        name: newSeniorForm.name,
        language: newSeniorForm.language,
        family_pin: newSeniorForm.familyPin,
        user_id: user.id,
        guardian_email: user.email,
        chronic_conditions: newSeniorForm.chronicConditions
          .split(',')
          .map(c => c.trim())
          .filter(c => c),
        emergency_contacts: newSeniorForm.emergencyContacts.filter(c => c.name && c.phone),
      })
      .select()
      .single();

    if (seniorError || !newSenior) {
      toast.error('Failed to create senior');
      setSaving(false);
      return;
    }

    // Link guardian to senior
    const { error: linkError } = await supabase
      .from('guardian_senior_links')
      .insert({
        guardian_id: user.id,
        senior_id: newSenior.id,
        is_primary: linkedSeniors.length === 0,
      });

    if (linkError) {
      toast.error('Failed to link senior');
    } else {
      toast.success('Senior added successfully!');
      setShowAddSenior(false);
      setNewSeniorForm({
        name: '',
        language: 'hinglish',
        chronicConditions: '',
        familyPin: '',
        emergencyContacts: [{ name: '', phone: '', relationship: '' }],
      });
      await refreshLinkedSeniors();
    }
    setSaving(false);
  };

  const handleDeleteSenior = async () => {
    if (!selectedSenior) return;
    
    setDeleting(true);
    
    // Delete in order: links, preferences, medications, logs, then senior
    await supabase.from('guardian_senior_links').delete().eq('senior_id', selectedSenior);
    await supabase.from('joy_preferences').delete().eq('senior_id', selectedSenior);
    await supabase.from('medication_logs').delete().eq('senior_id', selectedSenior);
    await supabase.from('medications').delete().eq('senior_id', selectedSenior);
    await supabase.from('activity_logs').delete().eq('senior_id', selectedSenior);
    await supabase.from('health_vitals').delete().eq('senior_id', selectedSenior);
    
    const { error } = await supabase.from('seniors').delete().eq('id', selectedSenior);
    
    if (error) {
      toast.error('Failed to delete senior profile');
    } else {
      toast.success('Senior profile deleted');
      await refreshLinkedSeniors();
    }
    
    setDeleting(false);
    setShowDeleteConfirm(null);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleting(true);
    
    try {
      // Delete all linked seniors first
      for (const s of linkedSeniors) {
        await supabase.from('guardian_senior_links').delete().eq('senior_id', s.id);
        await supabase.from('joy_preferences').delete().eq('senior_id', s.id);
        await supabase.from('medication_logs').delete().eq('senior_id', s.id);
        await supabase.from('medications').delete().eq('senior_id', s.id);
        await supabase.from('activity_logs').delete().eq('senior_id', s.id);
        await supabase.from('health_vitals').delete().eq('senior_id', s.id);
        await supabase.from('seniors').delete().eq('id', s.id);
      }
      
      // Delete profile and roles
      await supabase.from('profiles').delete().eq('user_id', user.id);
      await supabase.from('user_roles').delete().eq('user_id', user.id);
      
      // Sign out
      await signOut();
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    }
    
    setDeleting(false);
    setShowDeleteConfirm(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveGuardianProfile = async () => {
    if (!user || !guardianProfile) return;
    
    setSavingGuardian(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: guardianForm.fullName,
        phone: guardianForm.phone,
      })
      .eq('id', guardianProfile.id);
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
      setEditingGuardian(false);
      // Refresh auth context to get updated profile
      window.location.reload();
    }
    
    setSavingGuardian(false);
  };

  const addEmergencyContact = () => {
    setNewSeniorForm(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '', relationship: '' }],
    }));
  };

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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage seniors, account, and app preferences
          </p>
        </div>
        <div className="flex gap-3">
          <TactileButton
            variant="neutral"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </TactileButton>
          <TactileButton
            variant="primary"
            onClick={() => setShowAddSenior(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Senior
          </TactileButton>
        </div>
      </motion.div>

      {/* Guardian Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-warm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Guardian Profile
          </h2>
          {!editingGuardian ? (
            <button
              onClick={() => setEditingGuardian(true)}
              className="text-primary text-sm hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingGuardian(false)}
                className="text-muted-foreground text-sm hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGuardianProfile}
                disabled={savingGuardian}
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                {savingGuardian ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </button>
            </div>
          )}
        </div>
        
        {!editingGuardian ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm">Name</Label>
              <p className="text-foreground font-medium">{guardianProfile?.fullName || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Email</Label>
              <p className="text-foreground font-medium">{user?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Phone (for Senior Login)</Label>
              <p className="text-foreground font-medium">{guardianProfile?.phone || 'Not set'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Seniors use this phone + Family PIN to login
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={guardianForm.fullName}
                onChange={(e) => setGuardianForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={guardianForm.phone}
                onChange={(e) => setGuardianForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 9876543210"
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ Changing this will update senior login credentials
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Senior Profile */}
      {senior && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-warm p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Senior Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo */}
            <div className="flex flex-col items-center">
              <div 
                className="w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                {senior.photo_url ? (
                  <img src={senior.photo_url} alt={senior.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-14 h-14 text-muted-foreground" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                <Camera className="w-4 h-4" />
                Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }}
              />
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={senior.name}
                    onChange={(e) => setSenior(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select
                    value={senior.language}
                    onChange={(e) => setSenior(prev => prev ? { ...prev, language: e.target.value } : null)}
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background"
                  >
                    <option value="hinglish">Hinglish</option>
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Family PIN (4 digits)</Label>
                <Input
                  type="text"
                  maxLength={4}
                  value={senior.family_pin || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setSenior(prev => prev ? { ...prev, family_pin: value } : null);
                  }}
                  placeholder="1234"
                  className="h-12 font-mono text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground">
                  Senior uses this PIN with your phone number to login
                </p>
              </div>

              <div className="space-y-2">
                <Label>Chronic Conditions (comma separated)</Label>
                <Input
                  value={senior.chronic_conditions.join(', ')}
                  onChange={(e) => setSenior(prev => prev ? { 
                    ...prev, 
                    chronic_conditions: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                  } : null)}
                  placeholder="e.g., Diabetes, Hypertension"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Nudge Frequency
                </Label>
                <select
                  value={senior.nudge_frequency}
                  onChange={(e) => setSenior(prev => prev ? { ...prev, nudge_frequency: e.target.value } : null)}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background"
                >
                  <option value="low">Low (Medicines only)</option>
                  <option value="medium">Medium (+ Daily check-ins)</option>
                  <option value="high">High (+ Interactive prompts)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <TactileButton
              variant="primary"
              onClick={handleSaveSenior}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save Changes
            </TactileButton>
          </div>
        </motion.div>
      )}

      {/* Emergency Contacts */}
      {senior && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-warm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Emergency Contacts
            </h2>
            <button
              onClick={() => setSenior(prev => prev ? {
                ...prev,
                emergency_contacts: [...prev.emergency_contacts, { name: '', phone: '', relationship: '' }]
              } : null)}
              className="text-primary text-sm hover:underline"
            >
              + Add Contact
            </button>
          </div>

          <div className="space-y-4">
            {senior.emergency_contacts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No emergency contacts added
              </p>
            ) : (
              senior.emergency_contacts.map((contact, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-xl">
                  <Input
                    value={contact.name}
                    onChange={(e) => {
                      const updated = [...senior.emergency_contacts];
                      updated[index].name = e.target.value;
                      setSenior(prev => prev ? { ...prev, emergency_contacts: updated } : null);
                    }}
                    placeholder="Name"
                    className="h-12"
                  />
                  <Input
                    value={contact.phone}
                    onChange={(e) => {
                      const updated = [...senior.emergency_contacts];
                      updated[index].phone = e.target.value;
                      setSenior(prev => prev ? { ...prev, emergency_contacts: updated } : null);
                    }}
                    placeholder="Phone"
                    className="h-12"
                  />
                  <Input
                    value={contact.relationship}
                    onChange={(e) => {
                      const updated = [...senior.emergency_contacts];
                      updated[index].relationship = e.target.value;
                      setSenior(prev => prev ? { ...prev, emergency_contacts: updated } : null);
                    }}
                    placeholder="Relationship"
                    className="h-12"
                  />
                  <button
                    onClick={() => {
                      const updated = senior.emergency_contacts.filter((_, i) => i !== index);
                      setSenior(prev => prev ? { ...prev, emergency_contacts: updated } : null);
                    }}
                    className="h-12 px-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-warm p-6 border-2 border-destructive/20"
      >
        <h2 className="text-xl font-semibold text-destructive mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          These actions are irreversible. Please be certain before proceeding.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {senior && (
            <TactileButton
              variant="neutral"
              onClick={() => setShowDeleteConfirm('senior')}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <UserX className="w-5 h-5 mr-2" />
              Delete Senior Profile
            </TactileButton>
          )}
          <TactileButton
            variant="neutral"
            onClick={() => setShowDeleteConfirm('account')}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete My Account
          </TactileButton>
        </div>
      </motion.div>

      {/* Add Senior Modal */}
      {showAddSenior && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddSenior(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                Add New Senior
              </h2>
              <p className="text-sm text-muted-foreground">
                Register a senior to start caring for them
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label>Senior's Name *</Label>
                <Input
                  value={newSeniorForm.name}
                  onChange={(e) => setNewSeniorForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Dadi, Nani, Papa"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Family PIN (4 digits) *</Label>
                <Input
                  type="text"
                  maxLength={4}
                  value={newSeniorForm.familyPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setNewSeniorForm(prev => ({ ...prev, familyPin: value }));
                  }}
                  placeholder="1234"
                  className="h-12 font-mono text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground">
                  Senior will use your phone ({guardianProfile?.phone || 'Not set'}) + this PIN to login
                </p>
              </div>

              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <select
                  value={newSeniorForm.language}
                  onChange={(e) => setNewSeniorForm(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background"
                >
                  <option value="hinglish">Hinglish (Hindi + English)</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Chronic Conditions (comma separated)</Label>
                <Input
                  value={newSeniorForm.chronicConditions}
                  onChange={(e) => setNewSeniorForm(prev => ({ ...prev, chronicConditions: e.target.value }))}
                  placeholder="e.g., Diabetes, High BP"
                  className="h-12"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Emergency Contacts
                  </Label>
                  <button
                    type="button"
                    onClick={addEmergencyContact}
                    className="text-primary text-sm hover:underline"
                  >
                    + Add
                  </button>
                </div>
                {newSeniorForm.emergencyContacts.map((contact, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <Input
                      value={contact.name}
                      onChange={(e) => {
                        const updated = [...newSeniorForm.emergencyContacts];
                        updated[index].name = e.target.value;
                        setNewSeniorForm(prev => ({ ...prev, emergencyContacts: updated }));
                      }}
                      placeholder="Name"
                      className="h-10"
                    />
                    <Input
                      value={contact.phone}
                      onChange={(e) => {
                        const updated = [...newSeniorForm.emergencyContacts];
                        updated[index].phone = e.target.value;
                        setNewSeniorForm(prev => ({ ...prev, emergencyContacts: updated }));
                      }}
                      placeholder="Phone"
                      className="h-10"
                    />
                    <Input
                      value={contact.relationship}
                      onChange={(e) => {
                        const updated = [...newSeniorForm.emergencyContacts];
                        updated[index].relationship = e.target.value;
                        setNewSeniorForm(prev => ({ ...prev, emergencyContacts: updated }));
                      }}
                      placeholder="Relation"
                      className="h-10"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <TactileButton
                variant="neutral"
                className="flex-1"
                onClick={() => setShowAddSenior(false)}
              >
                Cancel
              </TactileButton>
              <TactileButton
                variant="primary"
                className="flex-1"
                onClick={handleAddNewSenior}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                Add Senior
              </TactileButton>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {showDeleteConfirm === 'senior' ? 'Delete Senior Profile?' : 'Delete Your Account?'}
              </h2>
              <p className="text-muted-foreground">
                {showDeleteConfirm === 'senior' 
                  ? 'This will permanently delete all data for this senior including medications, logs, and preferences.'
                  : 'This will permanently delete your account and all linked seniors. This cannot be undone.'
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              <TactileButton
                variant="neutral"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </TactileButton>
              <TactileButton
                variant="neutral"
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={showDeleteConfirm === 'senior' ? handleDeleteSenior : handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Delete'
                )}
              </TactileButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
