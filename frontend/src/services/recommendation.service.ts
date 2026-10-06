//  Recommendation related API calls will be handled here

import api from "../lib/api";
import type { ChatRecommendationResponse } from "../types/aiRecommendations";

export const recommendationService = {
  async getOutfitRecommendation(prompt: string, previousOutfit?: any): Promise<ChatRecommendationResponse> {
    try {
      const response = await api.post('/outfit/recommend', {
        message: prompt,
        previous_outfit: previousOutfit ? {
          outfit_name: previousOutfit.outfit_name,
          selected_items: previousOutfit.selected_items,
          styling_tips: previousOutfit.styling_tips
        } : null,
      });
      console.log("Reponse of the recommendations:: ", response.data)
      return response.data;
    } catch (error) {
      console.error('Error getting outfit recommendation:', error);
      throw error;
    }
  },

  async saveRecommendedOutfit(outfitData: any): Promise<any> {
    try {
      const response = await api.post('/outfit/save-recommendation', outfitData);
      return response.data;
    } catch (error) {
      console.error('Error saving recommended outfit:', error);
      throw error;
    }
  },

  async deleteRecommendedOutfit(outfitId: string): Promise<any> {
    try {
      const response = await api.post('/outfit/delete-recommendation', { outfit_id: outfitId });
      return response.data;
    } catch (error) {
      console.error('Error deleting recommended outfit:', error);
      throw error;
    }
  },

//   async retryRecommendedOutfit(): Promise<ChatRecommendationResponse> {
//     try {
//       const response = await api.post('/outfits/retry-recommendation');
//       return response.data;
//     } catch (error) {
//       console.error('Error saving recommended outfit:', error);
//       throw error;
//     }
//   }

};