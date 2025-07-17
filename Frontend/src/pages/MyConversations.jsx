import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, User, FileText, LoaderCircle } from "lucide-react";
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import MyConversationShow from './MyConversationShow';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export default function MyConversations() {
  const [conversations, setConversations] = useState([]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
      key: 'selection',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const navigate = useNavigate();

  // Fetch conversations
  const fetchConversations = () => {
    setLoading(true);
    const base = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');
    
    // Format dates in ISO format for API
    const startDate = dateRange[0].startDate.toISOString();
    const endDate = dateRange[0].endDate.toISOString();

    axios.get(`${base}/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      params: {
        start_date: startDate,
        end_date: endDate
      }
    })
      .then(res => {
        console.log('Fetched conversations:', res.data);
        setConversations(res.data);
      })
      .catch(err => {
        console.error('Error fetching conversations:', err)
    })
    .finally (()=> {
      setLoading(false);
    })
  };

  useEffect(() => {
    fetchConversations();
  }, [dateRange]); // Refetch when date range changes

  // Filter conversations by date range
  const filteredConversations = conversations.filter(conv => {
    const convDate = new Date(conv.created_at);
    const startDate = new Date(dateRange[0].startDate);
    const endDate = new Date(dateRange[0].endDate);
    
    // Debug logs
    console.log('Conversation date:', convDate);
    console.log('Start date:', startDate);
    console.log('End date:', endDate);
    console.log('Is within range:', convDate >= startDate && convDate <= endDate);
    
    return convDate >= startDate && convDate <= endDate;
  });

  // Debug log for filtered conversations
  console.log('Filtered conversations:', filteredConversations);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-blue-600" size={32} />
          <span className="text-2xl font-bold">My Conversations</span>
        </div>
      </div>
      <div className="border border-gray-200 rounded-xl bg-gray-50 p-6 mb-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold">Conversation History</h4>
          <button
            className="text-blue-600 underline text-sm font-semibold"
            onClick={() => setShowDatePicker(v => !v)}
          >
            {showDatePicker ? 'Hide Date Filter' : 'Change Date Range'}
          </button>
        </div>
        {showDatePicker && (
          <div className="mb-4">
            <DateRange
              editableDateInputs={true}
              onChange={item => {
                const selection = item.selection;
                // Only update if we have a valid selection
                if (selection.startDate) {
                  setDateRange([{
                    ...selection,
                    endDate: selection.endDate || selection.startDate
                  }]);
                }
              }}
              onRangeFocusChange={focusedRanges => {
                // Only hide when the user has finished selecting both dates
                if (focusedRanges.length === 0 && dateRange[0].startDate && dateRange[0].endDate) {
                  setShowDatePicker(false);
                }
              }}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              maxDate={new Date()}
            />
          </div>
        )}
        <div style={{ maxHeight: 600, overflowY: 'auto' }} className="rounded-xl bg-gray-50 shadow-inner p-2">
          {filteredConversations.length === 0 ? (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
              <p className="text-gray-600 text-lg">
                💬 No conversations found for the selected date range.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredConversations.map((conv) => (
                <li
                  key={conv.id}
                  className="flex items-center gap-3 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedConversationId(conv.id)}
                >
                  <MessageSquare className="text-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Conversation #{conv.id}</span>
                      {conv.test && (
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <FileText size={14} />
                          {conv.test.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {conv.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(conv.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Modal for Conversation Show */}
      {selectedConversationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative p-0">
            <button
              className="absolute top-4 left-4 z-10 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setSelectedConversationId(null)}
            >
              <span className="font-bold">&larr;</span> Back
            </button>
            <div className="p-6 pt-12">
              <MyConversationShow id={selectedConversationId} onBack={() => setSelectedConversationId(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 