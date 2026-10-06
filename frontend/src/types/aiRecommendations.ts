export interface ChatRecommendationItem {
  item_id: number;
  item_name: string;
  type: string;
  color: string;
  image_url: string;
  occasion: string;
  styling_reason: string;
}

export interface ChatRecommendationResponse {
  created_at: string;
  error_message: string | null;
  is_saved: boolean;
  outfit_id: number | null;
  outfit_name: string;
  selected_items: ChatRecommendationItem[];
  styling_tips: string;
  validation_passed: boolean;
  text_response: string;
  previous_outfit: ChatRecommendationItem[] 
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendation?: ChatRecommendationResponse;
  isGenerating?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentUserId?: string | null;

}