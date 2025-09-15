-- Fix RLS performance issues by optimizing auth function calls
-- This migration addresses performance warnings related to auth function calls in RLS policies

-- Notifications table RLS policies optimization
ALTER POLICY notifications_select_company_members ON public.notifications
  USING (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid())));

ALTER POLICY notifications_insert_company_members ON public.notifications
  WITH CHECK (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid())));

ALTER POLICY notifications_update_company_members ON public.notifications
  USING (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid())))
  WITH CHECK (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid())));

ALTER POLICY notifications_delete_company_admins ON public.notifications
  USING (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid()) AND cm.role = 'admin'));

-- Follow up rules table RLS policies optimization
ALTER POLICY follow_up_rules_select_company_members ON public.follow_up_rules
  USING (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid())));

ALTER POLICY follow_up_rules_insert_company_admins ON public.follow_up_rules
  WITH CHECK (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid()) AND cm.role = 'admin'));

ALTER POLICY follow_up_rules_update_company_admins ON public.follow_up_rules
  USING (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid()) AND cm.role = 'admin'))
  WITH CHECK (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid()) AND cm.role = 'admin'));

ALTER POLICY follow_up_rules_delete_company_admins ON public.follow_up_rules
  USING (company_id IN (SELECT cm.company_id FROM public.company_memberships cm WHERE cm.user_id = (SELECT auth.uid()) AND cm.role = 'admin'));

-- Notification settings table RLS policies optimization
ALTER POLICY notification_settings_select_own ON public.notification_settings
  USING (user_id = (SELECT auth.uid()));

ALTER POLICY notification_settings_insert_own ON public.notification_settings
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY notification_settings_update_own ON public.notification_settings
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY notification_settings_delete_own ON public.notification_settings
  USING (user_id = (SELECT auth.uid()));

-- Leads table RLS policies optimization
ALTER POLICY leads_select_own ON public.leads
  USING (user_id = (SELECT auth.uid()));

ALTER POLICY leads_insert_own ON public.leads
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY leads_update_own ON public.leads
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY leads_delete_own ON public.leads
  USING (user_id = (SELECT auth.uid()));

-- Surveys table RLS policies optimization
ALTER POLICY surveys_select_own ON public.surveys
  USING (user_id = (SELECT auth.uid()));

ALTER POLICY surveys_insert_own ON public.surveys
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY surveys_update_own ON public.surveys
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));