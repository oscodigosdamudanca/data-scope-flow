// Analytics Module Exports

// Pages
export { default as AnalyticsPage } from './pages/AnalyticsPage';

// Components
export { default as ExhibitorDashboard } from './components/ExhibitorDashboard';
export { default as LeadsAnalytics } from './components/LeadsAnalytics';
export { default as SurveysAnalytics } from './components/SurveysAnalytics';
export { default as OverviewAnalytics } from './components/OverviewAnalytics';
export { default as DashboardSettings } from './components/DashboardSettings';

// Hooks
export { useAnalytics } from './hooks/useAnalytics';
export { useBIConfig } from './hooks/useBIConfig';

// Routes
export { default as AnalyticsRoutes, analyticsPermissions, analyticsNavigation } from './routes';

// Types
export type { AnalyticsData, DateRange } from './hooks/useAnalytics';
export type { BIConfig, WidgetConfig, LayoutConfig } from './hooks/useBIConfig';