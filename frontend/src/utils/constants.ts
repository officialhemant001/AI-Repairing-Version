export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

export const APP_NAME = 'AI Repair Vision';
export const APP_DESCRIPTION = 'AI-powered electronic device troubleshooting — diagnose, repair, and stay safe.';

export const SEVERITY_CONFIG = {
  low: { color: 'green', label: 'Low' },
  medium: { color: 'yellow', label: 'Medium' },
  high: { color: 'orange', label: 'High' },
  critical: { color: 'red', label: 'Critical' },
};
