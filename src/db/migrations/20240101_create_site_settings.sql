-- Insert default contact settings if they don't exist
INSERT INTO public.site_settings (setting_key, setting_value)
SELECT 'contact', '{"contact_email": "blvzeunit@gmail.com", "contact_phone": "", "contact_address": "4562 Sokak No:31 Kat:2 Daire:2 Sevgi Mahallesi Karabağlar/İzmir"}'::json
WHERE NOT EXISTS (
    SELECT 1 FROM public.site_settings WHERE setting_key = 'contact'
);
