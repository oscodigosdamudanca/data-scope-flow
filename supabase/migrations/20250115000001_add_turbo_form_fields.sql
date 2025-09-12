-- Add fields for turbo form functionality
-- Add source_type field to track lead origin (turbo_form, manual, etc)
-- Add lgpd_consent field for LGPD compliance

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS lgpd_consent BOOLEAN DEFAULT false;

-- Update existing records to have default values
UPDATE public.leads 
SET source_type = 'manual', lgpd_consent = false 
WHERE source_type IS NULL OR lgpd_consent IS NULL;

-- Add check constraint for source_type
ALTER TABLE public.leads 
ADD CONSTRAINT check_source_type 
CHECK (source_type IN ('manual', 'turbo_form', 'qr_code', 'survey', 'website', 'social_media', 'referral', 'event', 'cold_outreach', 'other'));

-- Create index for better performance on source_type queries
CREATE INDEX IF NOT EXISTS idx_leads_source_type ON public.leads(source_type);
CREATE INDEX IF NOT EXISTS idx_leads_lgpd_consent ON public.leads(lgpd_consent);

-- Add comment for documentation
COMMENT ON COLUMN public.leads.source_type IS 'Origin of the lead: turbo_form, manual, qr_code, survey, etc';
COMMENT ON COLUMN public.leads.lgpd_consent IS 'LGPD consent given by the lead for data processing';