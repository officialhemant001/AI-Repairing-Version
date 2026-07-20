export interface ScanImage {
  id: number;
  image: string;
  image_type: 'device' | 'damage' | 'label' | 'manual' | 'other';
  caption: string;
  display_order: number;
}

export interface ScanDocument {
  id: number;
  file: string;
  doc_type: 'manual' | 'repair_report' | 'warranty' | 'other';
  original_filename: string;
  created_at: string;
}

export interface Scan {
  id: number;
  report_id: string;
  device_name: string;
  appliance_category: string;
  category_name?: string;
  category_icon?: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  status: 'pending' | 'processing' | 'diagnosed' | 'in_progress' | 'repaired' | 'failed';
  input_type: 'image' | 'text' | 'voice' | 'chat' | 'pdf';
  description: string;
  result: Record<string, any>;
  root_cause: string;
  affected_components: string[];
  possible_causes: string[];
  troubleshooting_steps: string[];
  repair_steps: string[];
  tools_required: string[];
  safety_warnings: string[];
  preventive_maintenance: string;
  repair_difficulty: string;
  estimated_cost: string;
  estimated_time: string;
  technician_required: boolean;
  is_favorite: boolean;
  is_bookmarked?: boolean;
  image?: string;
  images?: ScanImage[];
  documents?: ScanDocument[];
  created_at: string;
  updated_at: string;
}

export interface ScanListResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: Scan[];
}

export interface ScanCreatePayload {
  image?: Blob;
  description?: string;
  input_type: 'image' | 'text' | 'voice' | 'chat' | 'pdf';
  category_slug?: string;
  device_name?: string;
}
