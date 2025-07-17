import React, { useState, useEffect } from "react";
import { MessageCircle, X, BotMessageSquare, Send, RotateCcw, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Swal from 'sweetalert2';
import aiChatService from '../services/aiChatService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { Bar as ChartBar, Line as ChartLine, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  ChartTooltip,
  ChartLegend
);

function tryParseJSON(text) {
  // Remove Markdown code block if present
  let cleaned = text.trim();
  // Remove ```json or ``` if present
  cleaned = cleaned.replace(/^```json|^```|```$/gim, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object or array from anywhere in the string
    const match = cleaned.match(/({[\s\S]*})|(\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // ignore
      }
    }
  }
  return null;
}

export default function ResultChatWidget({ testId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your AI Result Analyst. I'm loading your test data to provide you with the best analysis. This will just take a moment..." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [chartModal, setChartModal] = useState({ open: false, chart: null, title: '' });

  // Preload test data when component mounts
  useEffect(() => {
    if (testId) {
      aiChatService.preloadTestData(testId);
    }
  }, [testId]);

  const chartComponents = {
    bar: ChartBar,
    line: ChartLine,
    pie: Pie,
    doughnut: Doughnut,
    radar: Radar,
    polarArea: PolarArea,
  };

  const handleOpenChat = async () => {
    setOpen(true);
    
    if (!conversationId) {
      try {
        const result = await aiChatService.findOrCreateConversation(testId);
        setConversationId(result.conversation_id);
        
        // Auto-sync data on first open
        await handleSyncResults(result.conversation_id);
      } catch (error) {
        console.error('Error initializing result chat:', error);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Sorry, there was an error initializing the chat. Please try again." }
        ]);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setLoading(true);
    
    try {
      const result = await aiChatService.sendResultMessage(input, conversationId, testId);
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
        let errorMessage = "Sorry, something went wrong while analyzing your results.";
        if (err.response && err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
        setMessages((prev) => [...prev, { sender: "bot", text: errorMessage }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSyncResults = async (overrideConversationId = null) => {
    setSyncing(true);
    const convId = overrideConversationId || conversationId;
    
    // Show syncing message
    const isInitialSync = messages.length === 1; // Only the initial welcome message
    if (!isInitialSync) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "🔄 Syncing latest test data..." }
      ]);
    }
    
    try {
      const result = await aiChatService.syncResultData(testId, convId);
      
      // Update conversation ID if returned from sync
      if (result.conversation_id) {
        setConversationId(result.conversation_id);
      }
      
      if (isInitialSync) {
        // Replace the initial loading message with the success message
        setMessages([
          { sender: "bot", text: "✅ Data loaded successfully! I'm your AI Result Analyst. I can help you analyze test performance, identify patterns, and provide insights to improve your assessment strategies. Ask me anything about your test results!" }
        ]);
      } else {
        // Update the syncing message with success
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            sender: "bot", 
            text: result.message || "✅ Results synced! You can now chat with the AI about the latest data." 
          };
          return newMessages;
        });
      }
    } catch (error) {
      if (isInitialSync) {
        setMessages([
          { sender: "bot", text: "❌ Failed to load test data. Please try refreshing the page or contact support if the issue persists." }
        ]);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            sender: "bot", 
            text: "❌ Failed to sync results. Please try again." 
          };
          return newMessages;
        });
      }
    }
    setSyncing(false);
  };

  // Add a function to handle reset and then sync
  const handleResetAndSync = async () => {
    try {
      const result = await aiChatService.resetResultConversation(testId);
      setConversationId(result.conversation_id);
      // Immediately sync for the new conversation
      await handleSyncResults(result.conversation_id);
    } catch (error) {
      console.error('Error resetting and syncing chat:', error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, there was an error resetting the chat. Please try again." }
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white rounded-full p-4 shadow-2xl flex items-center transition-all duration-200"
          onClick={handleOpenChat}
          aria-label="Open Result Analysis Chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 w-full max-w-[400px] sm:bottom-8 sm:right-8 sm:w-[400px] max-h-[90vh] sm:max-h-[600px] animate-fade-in">
          <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl border border-gray-200 flex flex-col h-[90vh] sm:h-[600px]">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-green-600 to-green-400 sm:rounded-t-3xl">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <BotMessageSquare size={24} />
                Result Analysis
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSyncResults()}
                  className="text-white hover:bg-green-700 rounded-full p-1 transition"
                  title={syncing ? "Loading data..." : "Sync latest results"}
                  disabled={syncing}
                >
                  <RotateCcw size={18} className={syncing ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={handleResetAndSync}
                  className="text-white hover:bg-red-600 rounded-full p-1 transition"
                  title="Reset Chat"
                  aria-label="Reset Chat"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.51 19M3 15v6h6"></path></svg>
                </button>
                <button
                  className="text-white hover:bg-green-700 rounded-full p-1 transition"
                  onClick={() => setOpen(false)}
                  aria-label="Close Chat"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`mb-3 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs px-4 py-3 rounded-lg shadow text-sm ${
                    m.sender === "user" 
                      ? "bg-green-600 text-white" 
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}>
                    <div className="font-semibold mb-1">
                      {m.sender === "user" ? "You" : "AI Analyst"}:
                    </div>
                    <div className="whitespace-pre-wrap">
                      {m.sender === "bot" ? (
                        (() => {
                          console.log('Processing AI message:', m.text);
                          const parsed = tryParseJSON(m.text);
                          console.log('Parsed JSON from AI:', parsed);
                          
                          // Check if AI provided a structured response with type
                          if (parsed && typeof parsed === 'object') {
                            console.log('AI response structure:', {
                              hasType: !!parsed.type,
                              hasData: !!parsed.data,
                              hasLabels: !!(parsed.data && parsed.data.labels),
                              hasDatasets: !!(parsed.data && parsed.data.datasets),
                              isArray: Array.isArray(parsed),
                              keys: Object.keys(parsed)
                            });
                            
                            // Case 1: AI provided {type: "chart_type", data: {labels, datasets}}
                            if (parsed.type && parsed.data && parsed.data.labels && parsed.data.datasets) {
                              console.log('Detected structured chart from AI:', parsed.type);
                              const ChartComponent = chartComponents[parsed.type] || ChartBar;
                              return (
                                <div>
                                  <div style={{ maxHeight: 250, width: '100%', overflow: 'auto', marginBottom: 8, position: 'relative', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e5e7eb' }}>
                                    <button
                                      style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: 4, padding: 2, cursor: 'pointer' }}
                                      title="Expand chart"
                                      onClick={() => setChartModal({ open: true, chart: parsed.type, data: parsed.data, title: parsed.type ? parsed.type.toUpperCase() + ' Chart' : 'Chart' })}
                                    >
                                      <Maximize2 size={16} />
                                    </button>
                                    <ChartComponent data={parsed.data} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                                  </div>
                                </div>
                              );
                            }
                            
                            // Case 2: AI provided {labels, datasets} directly (legacy format)
                            else if (parsed.labels && parsed.datasets) {
                              console.log('Detected legacy chart format from AI (no type specified), defaulting to bar chart');
                              const ChartComponent = ChartBar; // Default to bar chart
                              return (
                                <div>
                                  <div style={{ maxHeight: 250, width: '100%', overflow: 'auto', marginBottom: 8, position: 'relative', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e5e7eb' }}>
                                    <button
                                      style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: 4, padding: 2, cursor: 'pointer' }}
                                      title="Expand chart"
                                      onClick={() => setChartModal({ open: true, chart: 'bar', data: parsed, title: 'Bar Chart' })}
                                    >
                                      <Maximize2 size={16} />
                                    </button>
                                    <ChartComponent data={parsed} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                                  </div>
                                </div>
                              );
                            }
                            
                            // Case 3: AI provided an array (table data)
                            else if (Array.isArray(parsed) && parsed.length > 0) {
                              console.log('Detected table data from AI:', parsed.length, 'rows');
                              const headers = Object.keys(parsed[0]);
                              const rows = parsed.map(row => headers.map(header => row[header]));
                              
                              return (
                                <div>
                                  <div style={{ maxHeight: 300, overflow: 'auto', marginBottom: 8 }}>
                                    <DataGrid
                                      rows={parsed.map((row, index) => ({ id: index, ...row }))}
                                      columns={headers.map(header => ({ field: header, headerName: header, flex: 1 }))}
                                      pageSize={5}
                                      rowsPerPageOptions={[5, 10]}
                                      disableSelectionOnClick
                                      autoHeight
                                    />
                                  </div>
                                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button
                                      onClick={() => exportToCSV(headers, rows, 'table.csv')}
                                      style={{ padding: '4px 8px', fontSize: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                    >
                                      Export CSV
                                    </button>
                                    <button
                                      onClick={() => exportToPDF(headers, rows, 'table.pdf')}
                                      style={{ padding: '4px 8px', fontSize: '12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                    >
                                      Export PDF
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            
                            // Case 4: AI provided {type: "table", data: [...]}
                            else if (parsed.type === 'table' && Array.isArray(parsed.data) && parsed.data.length > 0) {
                              console.log('Detected structured table from AI');
                              const headers = Object.keys(parsed.data[0]);
                              const rows = parsed.data.map(row => headers.map(header => row[header]));
                              
                              return (
                                <div>
                                  <div style={{ maxHeight: 300, overflow: 'auto', marginBottom: 8 }}>
                                    <DataGrid
                                      rows={parsed.data.map((row, index) => ({ id: index, ...row }))}
                                      columns={headers.map(header => ({ field: header, headerName: header, flex: 1 }))}
                                      pageSize={5}
                                      rowsPerPageOptions={[5, 10]}
                                      disableSelectionOnClick
                                      autoHeight
                                    />
                                  </div>
                                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button
                                      onClick={() => exportToCSV(headers, rows, 'table.csv')}
                                      style={{ padding: '4px 8px', fontSize: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                    >
                                      Export CSV
                                    </button>
                                    <button
                                      onClick={() => exportToPDF(headers, rows, 'table.pdf')}
                                      style={{ padding: '4px 8px', fontSize: '12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                    >
                                      Export PDF
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            
                            console.log('AI response is JSON but not recognized as chart or table data, falling back to markdown');
                          }
                          
                          // fallback to Markdown rendering with code block highlighting
                          return (
                            <ReactMarkdown
                              components={{
                                code({inline, className, children, ...props}) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={materialLight}
                                      language={match[1]}
                                      PreTag="div"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className={className} {...props}>{children}</code>
                                  );
                                },
                                table: (props) => (
                                  <table className="markdown-table" {...props} />
                                )
                              }}
                            >
                              {m.text}
                            </ReactMarkdown>
                          );
                        })()
                      ) : (
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mb-3 flex justify-start">
                  <div className="max-w-xs px-4 py-3 rounded-lg shadow text-sm bg-white text-gray-900 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      <span>Analyzing your results...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white sm:rounded-b-3xl">
              <div className="flex items-center gap-2">
                <input
                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  placeholder="Ask about test performance analysis..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={loading || (messages.length === 1 && syncing)}
                />
                <button
                  onClick={sendMessage}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading || !input.trim() || (messages.length === 1 && syncing)}
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                💡 Try asking: "Group students according to their score ranges and display the distribution in a bar chart."
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Modal */}
      {chartModal.open && chartModal.data && chartModal.chart && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999,
          background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #0002', padding: 24, minWidth: 320, minHeight: 320, maxWidth: '90vw', maxHeight: '90vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <button
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}
              onClick={() => setChartModal({ open: false })}
              title="Close"
            >
              <X size={22} />
            </button>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>{chartModal.title || 'Chart'}</div>
            <div style={{ flex: 1, minHeight: 300, minWidth: 300 }}>
              {chartComponents[chartModal.chart] && (
                React.createElement(chartComponents[chartModal.chart], {
                  data: chartModal.data,
                  options: { responsive: true, plugins: { legend: { position: 'top' } } }
                })
              )}
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
        .markdown-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          font-size: 0.95em;
        }
        .markdown-table th, .markdown-table td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: left;
        }
        .markdown-table th {
          background: #f3f4f6;
          font-weight: bold;
          color: #2563eb;
        }
        .markdown-table tr:nth-child(even) {
          background: #f9fafb;
        }
      `}</style>
    </>
  );
} 