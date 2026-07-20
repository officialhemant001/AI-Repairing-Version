import apiClient from './apiClient';
import { Scan, ScanListResponse } from '../types/scan';
import { Report } from '../types/report';
import { ChatSession, ChatSessionDetail } from '../types/chat';

export interface DeviceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
}

export const scanService = {
  /**
   * Upload image(s) and PDF for device analysis.
   */
  uploadImage: async (
    imageBlob: Blob,
    categorySlug: string = '',
    description: string = '',
    deviceName: string = '',
    additionalImages: Blob[] = [],
    pdfDocument?: File
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'capture.jpg');
    if (categorySlug) formData.append('category_slug', categorySlug);
    if (description) formData.append('description', description);
    if (deviceName) formData.append('device_name', deviceName);
    
    additionalImages.forEach((blob, idx) => {
      formData.append('additional_images', blob, `damage_${idx}.jpg`);
    });

    if (pdfDocument) {
      formData.append('pdf_document', pdfDocument);
    }

    const response = await apiClient.post('/api/scan/analyze/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  /**
   * Analyze device from text description.
   */
  analyzeText: async (description: string, categorySlug: string = ''): Promise<any> => {
    const response = await apiClient.post('/api/scan/analyze-text/', {
      description,
      category_slug: categorySlug,
    });
    return response.data.data;
  },

  /**
   * Get scan history (filterable and searchable).
   */
  getHistory: async (filters: Record<string, any> = {}): Promise<ScanListResponse> => {
    const response = await apiClient.get('/api/scan/', { params: filters });
    return response.data;
  },

  /**
   * Get full details for a specific scan.
   */
  getScanDetail: async (id: number | string): Promise<Scan> => {
    const response = await apiClient.get(`/api/scan/${id}/`);
    return response.data;
  },

  /**
   * Delete a scan.
   */
  deleteScan: async (id: number | string): Promise<any> => {
    const response = await apiClient.delete(`/api/scan/${id}/delete/`);
    return response.data;
  },

  /**
   * Toggle scan favorite status.
   */
  toggleFavorite: async (id: number | string): Promise<boolean> => {
    const response = await apiClient.post(`/api/scan/${id}/favorite/`);
    return response.data.data.is_favorite;
  },

  /**
   * Toggle scan bookmark status.
   */
  toggleBookmark: async (id: number | string): Promise<boolean> => {
    const response = await apiClient.post(`/api/scan/${id}/bookmark/`);
    return response.data.data.is_bookmarked;
  },

  /**
   * List user bookmarks.
   */
  getBookmarks: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/scan/bookmarks/');
    return response.data.results || response.data;
  },

  /**
   * Fetch active device categories.
   */
  getCategories: async (): Promise<DeviceCategory[]> => {
    const response = await apiClient.get('/api/devices/categories/');
    return response.data;
  },

  /**
   * Generate a PDF report from scan analysis.
   */
  generateReport: async (scanId: number | string): Promise<Report> => {
    const response = await apiClient.post(`/api/reports/generate/${scanId}/`);
    return response.data.data;
  },

  /**
   * Get all user reports.
   */
  getReports: async (): Promise<Report[]> => {
    const response = await apiClient.get('/api/reports/');
    return response.data.results || response.data;
  },

  /**
   * Get public shared report.
   */
  getSharedReport: async (shareToken: string): Promise<Report> => {
    const response = await apiClient.get(`/api/reports/share/${shareToken}/`);
    return response.data;
  },

  /**
   * Toggle report sharing.
   */
  toggleReportSharing: async (id: number | string): Promise<{ is_public: boolean; share_url: string }> => {
    const response = await apiClient.post(`/api/reports/${id}/share/`);
    return response.data.data;
  },

  /**
   * Get list of chat sessions.
   */
  getChatSessions: async (): Promise<ChatSession[]> => {
    const response = await apiClient.get('/api/scan/chat/sessions/');
    return response.data.results || response.data;
  },

  /**
   * Get chat session detail.
   */
  getChatSessionDetail: async (sessionId: number | string): Promise<ChatSessionDetail> => {
    const response = await apiClient.get(`/api/scan/chat/sessions/${sessionId}/`);
    return response.data;
  },

  /**
   * Send a chat message and get AI response.
   */
  sendChatMessage: async (
    messages: { role: string; content: string }[],
    scanId?: number | string | null,
    sessionId?: number | string | null,
    applianceCategory: string = ''
  ): Promise<any> => {
    const response = await apiClient.post('/api/scan/chat/', {
      messages,
      scan_id: scanId,
      session_id: sessionId,
      appliance_category: applianceCategory,
    });
    return response.data.data;
  },
};
