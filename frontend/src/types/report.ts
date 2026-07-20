export interface ReportVersion {
  id: number;
  version_number: number;
  pdf_file: string;
  changes: Record<string, any>;
  created_at: string;
}

export interface Report {
  id: number;
  report_uuid: string;
  scan_id: number;
  scan_issue: string;
  scan_device: string;
  pdf_file?: string;
  qr_code_image?: string;
  version: number;
  report_data: Record<string, any>;
  is_public: boolean;
  share_token: string;
  generated_at: string;
  versions?: ReportVersion[];
}
