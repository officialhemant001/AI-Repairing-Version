export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const APP_NAME = 'AI Repair Vision';
export const APP_DESCRIPTION = 'AI-powered electrical appliance troubleshooting — diagnose, repair, and stay safe.';

export const APPLIANCE_CATEGORIES = [
  { value: 'ceiling_fan', label: 'Ceiling Fan', icon: '🪭' },
  { value: 'cooler', label: 'Cooler', icon: '❄️' },
  { value: 'ac', label: 'AC', icon: '🌡️' },
  { value: 'refrigerator', label: 'Refrigerator', icon: '🧊' },
  { value: 'washing_machine', label: 'Washing Machine', icon: '🫧' },
  { value: 'water_pump', label: 'Water Pump', icon: '💧' },
  { value: 'tv', label: 'TV', icon: '📺' },
  { value: 'mixer_grinder', label: 'Mixer Grinder', icon: '🔌' },
  { value: 'microwave', label: 'Microwave', icon: '📡' },
  { value: 'electric_iron', label: 'Electric Iron', icon: '👔' },
  { value: 'geyser', label: 'Geyser', icon: '🔥' },
  { value: 'general', label: 'Other Appliance', icon: '⚡' },
];

export const SEVERITY_CONFIG = {
  low: { color: 'green', label: 'Low' },
  medium: { color: 'yellow', label: 'Medium' },
  high: { color: 'orange', label: 'High' },
  critical: { color: 'red', label: 'Critical' },
};
