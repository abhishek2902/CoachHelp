import React, { useEffect, useState } from "react";
import axios from 'axios';
import { MessageSquare, Clock, User, FileText, ArrowLeft, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function MyConversationShow({ id, onBack }) {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const base = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');
    axios.get(`${base}/conversations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
      .then(res => {
        setConversation(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching conversation:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!conversation) return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-800">Conversation not found</h2>
      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Back to Conversations
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="text-gray-600" />
          </button>
          <MessageSquare className="text-blue-600" size={32} />
          <span className="text-2xl font-bold">Conversation #{conversation.id}</span>
        </div>
      </div>

      {/* Conversation Info Card */}
      <div className="border border-gray-200 rounded-xl bg-gray-50 p-6 mb-6 shadow">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <User size={16} className="text-gray-600" />
            {conversation.user.email}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} className="text-gray-600" />
            {new Date(conversation.created_at).toLocaleString()}
          </span>
          {conversation.test && (
            <span className="flex items-center gap-1">
              <FileText size={16} className="text-gray-600" />
              {conversation.test.title}
            </span>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }} className="rounded-xl bg-gray-50 shadow-inner p-2 mb-6">
        {conversation.chat_messages.length === 0 ? (
          <div className="text-gray-500">No messages in this conversation.</div>
        ) : (
          <ul className="space-y-3">
            {conversation.chat_messages.map((message) => (
              <li
                key={message.id}
                className={`flex items-start gap-3 p-4 rounded-lg ${message.role === 'user' ? 'bg-white' : 'bg-blue-50'} shadow-sm`}
              >
                {message.role === 'user' ? (
                  <User size={16} className="text-gray-600 mt-1" />
                ) : (
                  <Bot size={16} className="text-blue-600 mt-1" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{message.role === 'user' ? 'You' : 'AI Assistant'}</span>
                    <span className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString()}</span>
                    {message.token_count && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{message.token_count} tokens</span>
                    )}
                  </div>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Token Transactions (optional) */}
      {conversation.token_transactions && conversation.token_transactions.length > 0 && (
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-6 shadow">
          <h3 className="text-lg font-bold mb-4">Token Transactions</h3>
          <div className="space-y-2">
            {conversation.token_transactions.map(tx => (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-3 rounded-lg ${tx.amount > 0 ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono">{tx.amount > 0 ? '+' : ''}{tx.amount} tokens</span>
                  <span className="text-sm text-gray-600">({tx.source})</span>
                </div>
                <span className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 