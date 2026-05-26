import apiClient from './apiClient';

export const scanService = {
  /**
   * Upload an image for AI analysis.
   */
  uploadImage: async (imageBlob, applianceCategory = '') => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'capture.jpg');
    if (applianceCategory) {
      formData.append('appliance_category', applianceCategory);
    }

    const response = await apiClient.post('/api/scan/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Analyze appliance issue from text description.
   */
  analyzeText: async (description, applianceCategory = '') => {
    const response = await apiClient.post('/api/scan/text/', {
      description,
      appliance_category: applianceCategory,
    });
    return response.data;
  },

  /**
   * Get scan history for authenticated user.
   */
  getHistory: async () => {
    const response = await apiClient.get('/api/scan/history/');
    return response.data;
  },

  /**
   * Get full details for a specific scan.
   */
  getScanDetail: async (id) => {
    const response = await apiClient.get(`/api/scan/${id}/`);
    return response.data;
  },

  /**
   * Send a chat message and get AI response.
   */
  sendChatMessage: async (messages, scanId = null, applianceCategory = '') => {
    const response = await apiClient.post('/api/scan/chat/', {
      messages,
      scan_id: scanId,
      appliance_category: applianceCategory,
    });
    return response.data;
  },
};
