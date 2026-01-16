import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  Camera,
  Pill,
  Clock,
  Trash2,
  Edit,
  Check,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TactileButton } from '@/components/TactileButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ContextType {
  selectedSenior: string | null;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  pill_image_url: string | null;
  prescription_image_url: string | null;
  color: string | null;
  is_active: boolean;
}

export default function GuardianMedicines() {
  const { selectedSenior } = useOutletContext<ContextType>();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<{name: string; dosage: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pillImageInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['09:00'],
    color: '',
    pillImageFile: null as File | null,
    prescriptionImageFile: null as File | null,
  });

  useEffect(() => {
    if (selectedSenior) {
      fetchMedications();
    }
  }, [selectedSenior]);

  const fetchMedications = async () => {
    if (!selectedSenior) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('senior_id', selectedSenior)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (data) {
      setMedications(data.map(m => ({
        ...m,
        times: Array.isArray(m.times) ? m.times : []
      })) as Medication[]);
    }
    setLoading(false);
  };

  const handlePrescriptionUpload = async (file: File) => {
    setOcrProcessing(true);
    setShowOcrModal(true);

    // Simulate OCR processing (in production, call Google Vision API)
    // For demo, we'll simulate with a timeout
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulated OCR result
    const mockResult = {
      name: 'Metformin',
      dosage: '500mg - 1 tablet twice daily'
    };

    setOcrResult(mockResult);
    setFormData(prev => ({
      ...prev,
      name: mockResult.name,
      dosage: mockResult.dosage,
      prescriptionImageFile: file,
    }));
    setOcrProcessing(false);
  };

  const handleAddMedicine = async () => {
    if (!selectedSenior || !formData.name || !formData.dosage) {
      toast.error('Please fill in all required fields');
      return;
    }

    let pillImageUrl = null;
    let prescriptionImageUrl = null;

    // Upload pill image if provided
    if (formData.pillImageFile) {
      const fileName = `${selectedSenior}/${Date.now()}_pill.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medicine-images')
        .upload(fileName, formData.pillImageFile);

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('medicine-images')
          .getPublicUrl(fileName);
        pillImageUrl = urlData.publicUrl;
      }
    }

    // Upload prescription image if provided
    if (formData.prescriptionImageFile) {
      const fileName = `${selectedSenior}/${Date.now()}_prescription.jpg`;
      const { data: uploadData } = await supabase.storage
        .from('medicine-images')
        .upload(fileName, formData.prescriptionImageFile);

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('medicine-images')
          .getPublicUrl(fileName);
        prescriptionImageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from('medications')
      .insert({
        senior_id: selectedSenior,
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        times: formData.times,
        color: formData.color || null,
        pill_image_url: pillImageUrl,
        prescription_image_url: prescriptionImageUrl,
      });

    if (error) {
      toast.error('Failed to add medicine');
      console.error(error);
    } else {
      toast.success('Medicine added successfully!');
      setShowAddModal(false);
      setShowOcrModal(false);
      setOcrResult(null);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'daily',
        times: ['09:00'],
        color: '',
        pillImageFile: null,
        prescriptionImageFile: null,
      });
      fetchMedications();
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    const { error } = await supabase
      .from('medications')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete medicine');
    } else {
      toast.success('Medicine deleted');
      fetchMedications();
    }
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '12:00']
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? value : t)
    }));
  };

  if (!selectedSenior) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Please select a senior to manage their medications.
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
            Medicine Management
          </h1>
          <p className="text-muted-foreground">
            Add, edit, and schedule medications
          </p>
        </div>
        <div className="flex gap-3">
          <TactileButton
            variant="neutral"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5 mr-2" />
            Scan Prescription
          </TactileButton>
          <TactileButton
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Medicine
          </TactileButton>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePrescriptionUpload(file);
          }}
        />
      </motion.div>

      {/* Medications List */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-16 card-warm">
          <Pill className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Medicines Added
          </h2>
          <p className="text-muted-foreground mb-6">
            Add medicines to create reminders for your senior
          </p>
          <TactileButton
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Medicine
          </TactileButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((med, index) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-warm p-6 relative group"
            >
              {/* Pill image or icon */}
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
                {med.pill_image_url ? (
                  <img
                    src={med.pill_image_url}
                    alt={med.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">💊</span>
                )}
              </div>

              {/* Medicine info */}
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {med.name}
              </h3>
              <p className="text-muted-foreground mb-3">{med.dosage}</p>

              {/* Times */}
              <div className="flex flex-wrap gap-2">
                {med.times.map((time, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    <Clock className="w-3 h-3" />
                    {time}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={() => handleDeleteMedicine(med.id)}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Medicine Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Add New Medicine
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Medicine name */}
                <div className="space-y-2">
                  <Label>Medicine Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Metformin"
                    className="h-12"
                  />
                </div>

                {/* Dosage */}
                <div className="space-y-2">
                  <Label>Dosage *</Label>
                  <Input
                    value={formData.dosage}
                    onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g., 500mg - 1 tablet"
                    className="h-12"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background"
                  >
                    <option value="daily">Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                {/* Times */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Reminder Times</Label>
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="text-primary text-sm hover:underline"
                    >
                      + Add time
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.times.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot(index, e.target.value)}
                          className="h-12 flex-1"
                        />
                        {formData.times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="p-3 rounded-lg hover:bg-destructive/10 text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pill image */}
                <div className="space-y-2">
                  <Label>Pill Photo (for senior's reference)</Label>
                  <button
                    type="button"
                    onClick={() => pillImageInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-border rounded-xl hover:border-primary transition-colors flex flex-col items-center gap-2"
                  >
                    {formData.pillImageFile ? (
                      <>
                        <Check className="w-8 h-8 text-success" />
                        <span className="text-sm text-muted-foreground">
                          {formData.pillImageFile.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Tap to upload pill photo
                        </span>
                      </>
                    )}
                  </button>
                  <input
                    ref={pillImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormData(prev => ({ ...prev, pillImageFile: file }));
                    }}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <TactileButton
                  variant="neutral"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </TactileButton>
                <TactileButton
                  variant="primary"
                  className="flex-1"
                  onClick={handleAddMedicine}
                >
                  Add Medicine
                </TactileButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OCR Modal */}
      <AnimatePresence>
        {showOcrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl shadow-xl max-w-2xl w-full"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Prescription OCR
                </h2>
              </div>

              <div className="p-6">
                {ocrProcessing ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-lg text-foreground">Analyzing prescription...</p>
                    <p className="text-muted-foreground">Extracting medicine details</p>
                  </div>
                ) : ocrResult ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-success/10 rounded-xl border border-success/20">
                      <p className="text-success font-medium flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Medicine detected with high confidence
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Medicine Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dosage</Label>
                        <Input
                          value={formData.dosage}
                          onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Please verify the extracted information before confirming.
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <TactileButton
                  variant="neutral"
                  className="flex-1"
                  onClick={() => {
                    setShowOcrModal(false);
                    setOcrResult(null);
                  }}
                >
                  Cancel
                </TactileButton>
                {ocrResult && (
                  <TactileButton
                    variant="success"
                    className="flex-1"
                    onClick={() => {
                      setShowOcrModal(false);
                      setShowAddModal(true);
                    }}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Confirm & Continue
                  </TactileButton>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
