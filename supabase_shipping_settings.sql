-- Site ayarları tablosu oluştur
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) politikaları
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (kargo ücreti için)
CREATE POLICY "Anyone can read site settings"
    ON site_settings
    FOR SELECT
    USING (true);

-- Sadece adminler güncelleyebilir
CREATE POLICY "Only admins can update site settings"
    ON site_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Sadece adminler ekleyebilir
CREATE POLICY "Only admins can insert site settings"
    ON site_settings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Kargo ayarlarını ekle
INSERT INTO site_settings (setting_key, setting_value)
VALUES 
    ('shipping', '{"cost": 85, "freeThreshold": 800}'::jsonb)
ON CONFLICT (setting_key) 
DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Kontrol et
SELECT * FROM site_settings WHERE setting_key = 'shipping';
