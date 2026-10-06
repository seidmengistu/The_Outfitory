import React, { createContext, useEffect, useReducer, useState } from 'react';
import type {ReactNode} from "react"
import type { ChatMessage, ChatState } from '../types/aiRecommendations';
import { useAuth } from '../hooks/useAuth';

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'DELETE_MESSAGE'; payload: string } 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'LOAD_HISTORY'; payload: { messages: ChatMessage[], userId: string | null } };


interface ChatContextType extends ChatState {
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setLoading: (loading: boolean) => void;
  deleteMessage: (id: string) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Generate unique ID function
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'LOAD_HISTORY': 
      return { 
          ...state, 
          messages: action.payload.messages,
          currentUserId: action.payload.userId 
      };
    default:
      return state;
  }
};

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  currentUserId: null
};

const getStorageKey = (userId: string) => `outfitory_chat_history_${userId}`;

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, getToken } = useAuth();
  const [state, dispatch] = useReducer(chatReducer, initialState);
  
  const [isReady, setIsReady] = useState(false);

  const getUserId = () => {
      if (user?.id) return String(user.id);
      const token = getToken();
      if (!token) return null;
      try {
          const [, payload] = token.split(".");
          const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));

          return json?.sub ? String(json.sub) :
                (json.user_id ? String(json.user_id) :
                (json.id ? String(json.id) : null))
      } catch {
          return null;
      }
      
  };

  const userId = getUserId();

  useEffect(() => {``
    if (!userId) {
        dispatch({ type: 'LOAD_HISTORY', payload: { messages: [], userId: null } });
        setIsReady(false);
        return;
    }

    setIsReady(false);

    const key = getStorageKey(userId);
    try {
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            const messages = parsed.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }));
            dispatch({ type: 'LOAD_HISTORY', payload: { messages, userId } });
        } else {
            dispatch({ type: 'LOAD_HISTORY', payload: { messages: [], userId } });
        }
    } catch (error) {
        console.error('Failed to load chat history:', error);
        dispatch({ type: 'LOAD_HISTORY', payload: { messages: [], userId } });
    } finally {
        setIsReady(true);
    }
  }, [userId]);

  useEffect(() => {
    // Only save if we have a user, and the state matches the current user
    if (userId && state.currentUserId === userId && isReady) {
        const key = getStorageKey(userId);
        if (state.messages.length > 0) {
            localStorage.setItem(key, JSON.stringify({ messages: state.messages }));
        } else {
             localStorage.removeItem(key);
        }
    }
  }, [state.messages, userId, state.currentUserId, isReady]);


  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const id = generateUniqueId();
    const newMessage: ChatMessage = {
      ...message,
      id, 
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    return id;
  };

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const deleteMessage = (id: string) => {
    dispatch({ type: 'DELETE_MESSAGE', payload: id });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
    if (userId) {
        localStorage.removeItem(getStorageKey(userId));
    }
  };

  return (
    <ChatContext.Provider value={{
      ...state,
      addMessage,
      updateMessage,
      setLoading,
      deleteMessage,
      setError,
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};