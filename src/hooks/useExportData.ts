import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useExportData() {
  const [exporting, setExporting] = useState(false);

  const exportSeniorData = async (seniorId: string, seniorName: string) => {
    setExporting(true);
    try {
      const { data, error } = await (supabase.rpc as any)('export_senior_data', {
        senior_uuid: seniorId,
      });

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${seniorName.replace(/\s+/g, '_')}_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return { exportSeniorData, exporting };
}
