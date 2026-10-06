import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Container, Typography } from '@mui/material';
import { recommendationService } from '../../../services/recommendation.service';
import { useChat } from '../../../hooks/useChat';
import { ChatMessage } from './Chat';
import { ChatInput } from './ChatInput';
import { ToastContainer, type ToastMessage } from '../../ui/Toast';
import type { ChatRecommendationResponse } from '../../../types/aiRecommendations';

export const ChatContainer: React.FC = () => {
    const { messages, isLoading, addMessage, updateMessage, setError, deleteMessage } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const timeoutsRef = useRef<Record<string, number>>({});

    const [lastGeneratedOutfit, setLastGeneratedOutfit] = useState<ChatRecommendationResponse | null>(null);


    const showToast = useCallback((message: string, type: ToastMessage["type"]) => {
        const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, message, type }]);
        const timeoutId = window.setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
            if (timeoutsRef.current[id]) {
                clearTimeout(timeoutsRef.current[id]);
                delete timeoutsRef.current[id];
            }
        }, 4000);

        timeoutsRef.current[id] = timeoutId;
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        if (timeoutsRef.current[id]) {
            clearTimeout(timeoutsRef.current[id]);
            delete timeoutsRef.current[id];
        }
    }, []);

    useEffect(() => {
        if (shouldAutoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setShouldAutoScroll(false);
        }
    }, [messages, shouldAutoScroll]);

    const handleSendMessage = async (content: string) => {
        addMessage({
            type: 'user',
            content
        });

        const generatingMessageId = addMessage({
            type: 'assistant',
            content: '',
            isGenerating: true
        });

        // Auto-scroll when user sends message
        setShouldAutoScroll(true);

        try {
            const recommendation = await recommendationService.getOutfitRecommendation(content, lastGeneratedOutfit);
            console.log(`Recommendations:`, recommendation);

            if (recommendation.selected_items?.length > 0) {
                setLastGeneratedOutfit(recommendation);
            }
            
            updateMessage(generatingMessageId, {
                content: recommendation.outfit_name || `Here's your personalized outfit recommendation`,
                recommendation: recommendation.selected_items?.length > 0 ? recommendation : undefined,
                isGenerating: false
            });

            setShouldAutoScroll(true);

        } catch (error: any) {
            console.error('Error in handleSendMessage:', error);
            
            let errorMessage = 'Sorry, I encountered an error while generating your outfit recommendation. Please try again.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            updateMessage(generatingMessageId, {
                content: errorMessage,
                isGenerating: false
            });

            setError(errorMessage);
            showToast(errorMessage, 'error');
            setShouldAutoScroll(true);
        }
    };

    const handleSaveOutfit = async (outfitData: any) => {
        try {
            await recommendationService.saveRecommendedOutfit(outfitData);
            showToast('Outfit saved successfully!', 'success'); 
            
        } catch (error: any) {
            console.error('Failed to save outfit:', error);
            const errorMsg = error.response?.data?.error || 'Failed to save outfit. Please try again.';
            showToast(errorMsg, 'error');
        }
    };

    const handleDeleteRecommendation = async (messageId: string) => {
        try {
            const messageIndex = messages.findIndex(m => m.id === messageId);
            const message = messages[messageIndex];
            
            if (!message) return;

            if (message.recommendation && 
                lastGeneratedOutfit && 
                message.recommendation.outfit_name === lastGeneratedOutfit.outfit_name) {
                setLastGeneratedOutfit(null);
            }

            if (message.recommendation?.outfit_id && message.recommendation.is_saved) {
                try {
                    await recommendationService.deleteRecommendedOutfit(message.recommendation.outfit_id.toString());
                    showToast('Outfit deleted from your wardrobe.', 'success');
                } catch (err) {
                    console.error("Backend delete failed, but removing from UI anyway", err);
                }
            } else {
                showToast('Conversation removed.', 'success');
            }

            deleteMessage(messageId);

            if (messageIndex > 0) {
                const previousMessage = messages[messageIndex - 1];
                if (previousMessage.type === 'user') {
                    deleteMessage(previousMessage.id);
                }
            }

        } catch (error: any) {
            console.error('Failed to delete recommendation:', error);
            const errorMsg = error.response?.data?.error || 'Failed to remove recommendation.';
            showToast(errorMsg, 'error');
        }
    };

    const handleRegenerateRecommendation = async (messageId: string) => {
        const messageToRegenerate = messages.find(m => m.id === messageId);
        if (messageToRegenerate && messageToRegenerate.type === 'assistant') {
            const messageIndex = messages.findIndex(m => m.id === messageId);
            const previousUserMessage = messages[messageIndex - 1];
            
            if (previousUserMessage && previousUserMessage.type === 'user') {
                handleSendMessage(previousUserMessage.content);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative">
            <div className="flex items-center justify-between p-6 backdrop-blur-sm">
                <div>
                    <Typography variant="h4" className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        Create Outfits with AI
                    </Typography>
                    <Typography variant="body1" className="text-black dark:text-white">
                        Describe a look and Outfitory will suggest an outfit from your wardrobe
                    </Typography>
                </div>
            </div>

            <div 
                ref={messagesContainerRef}
                className={`${messages.length === 0 ? '' : 'flex-1 overflow-y-auto'} `}
                style={{ scrollBehavior: 'smooth' }}
            >
                <Container maxWidth="lg" className={messages.length === 0 ? '' : 'h-full'}>
                    {messages.length > 0 ? (
                        <div className="space-y-8 pb-6">
                            {messages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    onSaveOutfit={handleSaveOutfit}
                                    onDeleteRecommendation={handleDeleteRecommendation}
                                    onRegenerateRecommendation={handleRegenerateRecommendation}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <Typography variant="h6" className="text-gray-500 dark:text-gray-400 mt-4">
                                No messages yet. Start a conversation!
                            </Typography>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </Container>
            </div>

            <div className={`${messages.length === 0 ? '' : 'mt-auto'} p-6 backdrop-blur-sm`}>
                <Container maxWidth="lg">
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        disabled={isLoading}
                        isLoading={isLoading}
                    />
                </Container>
            </div>

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
};