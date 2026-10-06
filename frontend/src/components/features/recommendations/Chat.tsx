import React from 'react';
import { Avatar, Typography, IconButton, Button } from '@mui/material';
import type { ChatMessage as ChatMessageType } from '../../../types/aiRecommendations';
import { Person, AutoAwesome, Bookmark, Delete, Refresh } from '@mui/icons-material';
import AuthImage from '../../common/AuthImage';

interface ChatMessageProps {
  message: ChatMessageType;
  onSaveOutfit?: (outfitData: any) => void;
  onDeleteRecommendation?: (messageId: string) => void;
  onRegenerateRecommendation?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onSaveOutfit, 
  onDeleteRecommendation,
  onRegenerateRecommendation 
}) => {
  const isUser = message.type === 'user';
  const isGenerating = message.isGenerating;

  return (
    <div 
      className={`flex gap-4 mb-6 animate-slide-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      {/* Avatar */}
      <Avatar 
        className={`w-10 h-10 flex-shrink-0 shadow-sm ${
          isUser 
            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200' 
            : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200'
        }`}
        sx={{ width: 40, height: 40 }}
      >
        {isUser ? <Person className="w-5 h-5" /> : <AutoAwesome className="w-5 h-5" />}
      </Avatar>

      {/* Message Content Wrapper */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* User Message */}
        {isUser ? (
          <div 
            className="p-4 rounded-2xl rounded-tr-sm bg-indigo-600 text-white shadow-md w-fit"
          >
            <Typography variant="body1" className="text-white leading-relaxed whitespace-pre-wrap">
              {message.content}
            </Typography>
          </div>
        ) : (
          /* Assistant Message */
          <div className="w-full">
            {/* Loading State */}
            {isGenerating ? (
              <div 
                className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-sm w-fit"
              >
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-300 font-medium">
                    Generating your outfit...
                  </Typography>
                </div>
              </div>
            ) : (
              <>
                {/* Text Response */}
                {message.content && (
                  <div 
                    className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-sm mb-3 w-fit"
                  >
                    <Typography variant="body1" className="text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </Typography>
                  </div>
                )}

                {/* Outfit Recommendation Card */}
                {message.recommendation && (
                  <div 
                    className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-lg w-full"
                  >
                    {/* Header with Outfit Name and Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <Typography variant="h6" className="font-bold text-gray-900 dark:text-white">
                        {message.recommendation.outfit_name}
                      </Typography>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="contained"
                          startIcon={<Bookmark className="w-4 h-4" />}
                          onClick={() => onSaveOutfit?.(message.recommendation)}
                          className={`rounded-full px-4 py-1.5 text-sm font-medium shadow-none hover:shadow-md transition-all ${
                            message.recommendation.is_saved 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                          size="small"
                        >
                          {message.recommendation.is_saved ? 'Saved' : 'Save'}
                        </Button>
                        
                        <IconButton
                          onClick={() => onRegenerateRecommendation?.(message.id)}
                          className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 rounded-full p-2"
                          size="small"
                        >
                          <Refresh className="w-4 h-4" />
                        </IconButton>
                        
                        <IconButton
                          onClick={() => onDeleteRecommendation?.(message.id)}
                          className="dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded-full p-2 "
                          size="small"
                        >
                          <Delete className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </div>

                    {/* Clothing Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {message.recommendation.selected_items.map((item) => (
                        <div 
                          key={item.item_id} 
                          className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-white/20 transition-all duration-300"
                        >
                          <div className="relative mb-3 aspect-[4/4] rounded-lg overflow-hidden bg-gray-200 dark:bg-white/5">
                            {item.image_url ? (
                                <AuthImage
                                  srcPath={item.image_url}
                                  alt={item.item_name}
                                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-white/30">No Image</div>
                              )}
                          </div>
                          
                          <Typography variant="subtitle2" className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {item.item_name}
                          </Typography>
                          
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-md bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200 border border-purple-200 dark:border-purple-500/30">
                              {item.type}
                            </span>
                          </div>
                          
                          <Typography variant="caption" className="text-gray-600 dark:text-gray-400 leading-snug line-clamp-3 block">
                            {item.styling_reason}
                          </Typography>
                        </div>
                      ))}
                    </div>

                    {/* Styling Tips */}
                    {message.recommendation.styling_tips && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                          <Typography variant="subtitle2" className="font-semibold text-indigo-900 dark:text-indigo-200">
                            Styling Tips
                          </Typography>
                        </div>
                        <Typography variant="body2" className="text-indigo-800 dark:text-indigo-100 leading-relaxed">
                          {message.recommendation.styling_tips}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Timestamp */}
        <Typography 
          variant="caption" 
          className="text-gray-400 dark:text-gray-500 mt-1.5 px-1"
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </div>
    </div>
  );
};