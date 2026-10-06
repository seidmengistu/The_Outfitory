import React, { useState } from 'react';
import { Paper, InputBase, IconButton, CircularProgress } from '@mui/material';
import { ArrowUpward } from '@mui/icons-material';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Paper 
      component="form" 
      onSubmit={handleSubmit}
      className="w-full flex items-center p-8"
      sx={{ 
      borderRadius: '24px', 
      backgroundColor: 'transparent', 
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      
      <InputBase
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="e.g. 'I need a smart casual outfit for a rooftop dinner'"
      className="flex-1 px-8 text-lg"
      multiline
      maxRows={12}
      disabled={disabled}
      sx={{
        color: 'inherit',
        '& .MuiInputBase-input': {
        color: 'inherit',
        '&::placeholder': {
          color: 'text.secondary',
          opacity: 1,
          fontSize: '16px'
        }
        }
      }}
      />
      
      <IconButton 
        type="submit"
        disabled={!message.trim() || disabled || isLoading}
        className={`mr-2 p-3 rounded-full transition-all duration-200 ${
          !message.trim() || disabled || isLoading 
            ? 'bg-gray-600 text-gray-400' 
            : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:scale-105'
        }`}
      >
        {isLoading ? (
          <CircularProgress size={24} className="text-gray-400" />
        ) : (
          <ArrowUpward className="w-5 h-5" />
        )}
      </IconButton>
    </Paper>
  );
};