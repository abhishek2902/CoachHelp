import React, { useState } from "react";
import { Send, UploadCloud, BotMessageSquare, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Swal from 'sweetalert2';
import aiChatService from '../services/aiChatService';

export default function TestChatSidebar({ onAIUpdate, conversationId, messages, setMessages }) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setLoading(true);
    try {
      const result = await aiChatService.sendMessage(input, conversationId);
      if (result.test_update && onAIUpdate) {
        onAIUpdate(result.test_update);
      }
      setMessages((prev) => [...prev, { sender: "bot", text: result.reply }]);
    } catch (err) {
      if (err.message && err.message.includes('Insufficient tokens')) {
        Swal.fire({
          icon: 'warning',
          title: 'Insufficient Tokens',
          text: 'You have insufficient tokens. Please add balance to your wallet to continue using the AI chat.',
          confirmButtonText: 'Go to Wallet',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/account';
          }
        });
      } else {
        let errorMessage = "Sorry, something went wrong.";
        if (err.response && err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
        setMessages((prev) => [...prev, { sender: "bot", text: errorMessage }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversationId) return;
    setUploading(true);
    // Add loading message to chat
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `Uploaded document: ${file.name}` },
      { sender: "bot", text: "Processing document... This may take a few minutes.", loading: true }
    ]);
    try {
      console.log('Starting file upload...', { file: file.name, conversationId });
      const result = await aiChatService.uploadFile(file, conversationId);
      console.log('Upload response received:', result);
      // Remove loading message and add success message
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove the loading message
        { sender: "bot", text: result.message || result.reply || "Document processed. Here are the generated questions." }
      ]);
      if (result.test_update && onAIUpdate) {
        console.log('Calling onAIUpdate with test_update:', result.test_update);
        onAIUpdate(result.test_update);
      }
    } catch (err) {
      console.error('File upload error:', err);
      console.error('Error response:', err.response);
      let errorMessage = "Failed to process document.";
      if (err.response) {
        if (err.response.status === 503) {
          errorMessage = "AI service is currently unavailable. Please try again in a few minutes.";
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }
      // Remove loading message and add error message
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove the loading message
        { sender: "bot", text: errorMessage }
      ]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full md:w-96 p-4 bg-white shadow-lg rounded-l-2xl h-full flex flex-col border-l border-gray-200">
      <h2 className="text-xl font-bold mb-2 text-blue-700 flex items-center gap-2">
        <BotMessageSquare size={24} />
        AI Test Assistant
      </h2>
      <div className="flex-1 h-96 overflow-y-auto mb-3 border rounded p-2 bg-gray-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-xs px-3 py-2 rounded-lg shadow text-sm whitespace-pre-wrap ${
              m.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
            }`}>
              <strong>{m.sender === "user" ? "You" : "AI"}:</strong>{" "}
              {m.sender === "bot" ? (
                m.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>{m.text}</span>
                  </div>
                ) : (
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                )
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-2 flex justify-start">
            <div className="max-w-xs px-3 py-2 rounded-lg shadow text-sm bg-gray-200 text-gray-900">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>AI is typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Input Area */}
      <div className="flex items-center gap-2 mb-2 mt-2 w-full">
        <div className="flex flex-row items-center w-full bg-white rounded-full shadow px-2 py-1 focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200">
          {/* Upload Button */}
          <label
            className={`flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-colors duration-150
              ${uploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
            aria-label="Upload document"
            title="Upload document"
          >
            <UploadCloud size={22} />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
              aria-label="Upload document"
            />
          </label>
          {/* Text Input */}
          <input
            className="flex-grow bg-transparent border-none outline-none px-3 py-2 text-sm sm:text-base focus:ring-0"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading || uploading}
            aria-label="Type your message"
          />
          {/* Send Button */}
          <button
            onClick={sendMessage}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-150 disabled:opacity-50"
            disabled={loading || uploading}
            aria-label="Send message"
            type="button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
} 