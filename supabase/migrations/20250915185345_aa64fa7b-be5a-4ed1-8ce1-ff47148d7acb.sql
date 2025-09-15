-- Comprehensive database synchronization migration

-- 1. Update leads table with missing fields
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS lgpd_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS captured_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update source_type to match expected enum values
UPDATE public.leads SET source_type = 'manual' WHERE source_type IS NULL OR source_type = '';

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'custom',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'unread',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  lead_id UUID,
  action_url TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON public.notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_lead_id ON public.notifications(lead_id);

-- 3. Create follow_up_rules table
CREATE TABLE IF NOT EXISTS public.follow_up_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  notification_config JSONB NOT NULL DEFAULT '{}',
  schedule_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_follow_up_rules_company_id ON public.follow_up_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_rules_is_active ON public.follow_up_rules(is_active);

-- 4. Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  in_app_notifications BOOLEAN NOT NULL DEFAULT true,
  notification_types JSONB NOT NULL DEFAULT '{}',
  quiet_hours JSONB NOT NULL DEFAULT '{"enabled": false, "start_time": "22:00", "end_time": "08:00", "timezone": "UTC"}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_company_id ON public.notification_settings(company_id);

-- 5. Create bi_configs table for dashboard configurations
CREATE TABLE IF NOT EXISTS public.bi_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  dashboard_type VARCHAR(50) NOT NULL DEFAULT 'default',
  config JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bi_configs_user_id ON public.bi_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_bi_configs_company_id ON public.bi_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_bi_configs_dashboard_type ON public.bi_configs(dashboard_type);

-- 6. Enable RLS on all new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_configs ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for notifications
CREATE POLICY "notifications_select_company_members" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = notifications.company_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "notifications_insert_company_members" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = notifications.company_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "notifications_update_company_members" ON public.notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = notifications.company_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "notifications_delete_company_admins" ON public.notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = notifications.company_id 
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

-- 8. Create RLS policies for follow_up_rules
CREATE POLICY "follow_up_rules_select_company_members" ON public.follow_up_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = follow_up_rules.company_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "follow_up_rules_insert_company_admins" ON public.follow_up_rules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = follow_up_rules.company_id 
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

CREATE POLICY "follow_up_rules_update_company_admins" ON public.follow_up_rules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = follow_up_rules.company_id 
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

CREATE POLICY "follow_up_rules_delete_company_admins" ON public.follow_up_rules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = follow_up_rules.company_id 
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

-- 9. Create RLS policies for notification_settings
CREATE POLICY "notification_settings_select_own" ON public.notification_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notification_settings_insert_own" ON public.notification_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notification_settings_update_own" ON public.notification_settings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notification_settings_delete_own" ON public.notification_settings
  FOR DELETE USING (user_id = auth.uid());

-- 10. Create RLS policies for bi_configs
CREATE POLICY "bi_configs_select_own" ON public.bi_configs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "bi_configs_insert_own" ON public.bi_configs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "bi_configs_update_own" ON public.bi_configs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "bi_configs_delete_own" ON public.bi_configs
  FOR DELETE USING (user_id = auth.uid());

-- 11. Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all new tables
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_follow_up_rules_updated_at ON public.follow_up_rules;
CREATE TRIGGER update_follow_up_rules_updated_at
  BEFORE UPDATE ON public.follow_up_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON public.notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bi_configs_updated_at ON public.bi_configs;
CREATE TRIGGER update_bi_configs_updated_at
  BEFORE UPDATE ON public.bi_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();