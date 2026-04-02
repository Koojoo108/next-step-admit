import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id: string;
  school_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  admission_start: string | null;
  admission_end: string | null;
  updated_at: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  id: '',
  school_name: 'DUAPA ACADEMY',
  logo_url: null,
  favicon_url: null,
  admission_start: null,
  admission_end: null,
  updated_at: '',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      if (data) setSettings(data as unknown as SiteSettings);
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  return { settings, loading, refetch: fetchSettings };
};
