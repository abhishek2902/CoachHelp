import React, { useState } from "react";
import { MessageCircle, X, BotMessageSquare } from "lucide-react";
import TestChatSidebar from "./TestChatSidebar";
import aiChatService from '../services/aiChatService';

export default function ChatWidget({ onAIUpdate, conversationId, setConversationId, messages, setMessages }) {
  const [open, setOpen] = useState(false);

  const handleOpenChat = async () => {
    if (conversationId) {
      // Fetch latest test state
      try {
        const result = await aiChatService.getConversationState(conversationId);
        if (result.test_update && onAIUpdate) {
          onAIUpdate(result.test_update);
        }
      } catch (err) {
        // Optionally handle error
        console.error('Failed to fetch conversation state:', err);
      }
      setOpen(true);
      return;
    }
    try {
      const result = await aiChatService.resetConversation();
      setConversationId(result.conversation_id);
      setOpen(true);
    } catch (error) {
      console.error('Error resetting chat:', error);
      setOpen(true); // Still open the chat even if reset fails
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white rounded-full p-4 shadow-2xl flex items-center transition-all duration-200"
          onClick={handleOpenChat}
          aria-label="Open AI Chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-0 right-0 z-50 w-full max-w-[370px] sm:bottom-8 sm:right-8 sm:w-[370px] max-h-[90vh] sm:max-h-[540px] animate-fade-in"
        >
          <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl border border-gray-200 flex flex-col h-[90vh] sm:h-[540px]">
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-blue-400 sm:rounded-t-3xl">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <BotMessageSquare size={24} />
                AI Test Chat
              </div>
              <button
                className="text-white hover:bg-blue-700 hover:text-white rounded-full p-1 transition"
                onClick={() => setOpen(false)}
                aria-label="Close Chat"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TestChatSidebar onAIUpdate={onAIUpdate} conversationId={conversationId} messages={messages} setMessages={setMessages} />
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeInUp 0.25s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </>
  );
} 