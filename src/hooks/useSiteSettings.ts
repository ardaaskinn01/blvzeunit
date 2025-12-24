import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteSettings {
    contact_email: string;
    contact_phone: string;
    contact_address: string;
}

export function useSiteSettings() {
    const [settings, setSettings] = useState<SiteSettings>({
        contact_email: 'blvzeunit@gmail.com',
        contact_phone: '',
        contact_address: '4562 Sokak No:31 Kat:2 Daire:2 Sevgi Mahallesi Karabağlar/İzmir'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('setting_value')
                .eq('setting_key', 'contact')
                .single();

            if (error) {
                console.warn('Could not fetch site settings:', error.message);
                return;
            }

            const value = data?.setting_value as any;
            if (value) {
                setSettings({
                    contact_email: value.contact_email || 'blvzeunit@gmail.com',
                    contact_phone: value.contact_phone || '',
                    contact_address: value.contact_address || '4562 Sokak No:31 Kat:2 Daire:2 Sevgi Mahallesi Karabağlar/İzmir'
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { settings, loading, error, refetch: fetchSettings };
}
