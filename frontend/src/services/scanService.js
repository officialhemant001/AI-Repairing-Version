import apiClient from './apiClient';
import { UPLOAD_ENDPOINT } from '../utils/constants';

export const scanService = {
  uploadImage: async (imageBlob) => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'capture.jpg');

    try {
      // In a real app we uncomment this:
      // const response = await apiClient.post(UPLOAD_ENDPOINT, formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });
      // return response.data;
      
      // MOCK IMPLEMENTATION FOR NOW
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        id: Date.now().toString(),
        problem: 'Cracked Screen Detected',
        confidence: 94,
        description: 'The image shows a severe crack extending from the top left corner.',
        steps: [
          'Power off the device immediately.',
          'Apply clear tape over the crack to prevent glass shards from falling out.',
          'Take the device to a certified repair center.',
          'Consider a screen replacement.'
        ],
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
  
  getHistory: async () => {
    // In a real app, this would be an API call to get user's past scans
    // For now we read from local storage mock
    const user = JSON.parse(localStorage.getItem('ai_repair_user') || '{}');
    return user.history || [];
  }
};
