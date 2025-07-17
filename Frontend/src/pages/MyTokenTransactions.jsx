import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaPlusCircle, FaMinusCircle, FaWallet } from "react-icons/fa";
import { Line } from 'react-chartjs-2';
import { LoaderCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

export default function MyTokenTransactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingTxList] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
      key: 'selection',
    },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const TOKEN_RATE = Number(import.meta.env.VITE_API_RATE);

  // Fetch transactions and wallet balance
  const fetchWalletAndTransactions = () => {
    setLoading(true);
    const base = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');
    
    // Format dates in ISO format for API
    const startDate = dateRange[0].startDate.toISOString();
    const endDate = dateRange[0].endDate.toISOString();

    axios.get(`${base}/token_transactions`, {
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
        setTransactions(res.data.transactions);
        setBalance(res.data.wallet_balance);
      })
      .catch(err => {
        console.error('Error fetching transactions:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWalletAndTransactions();
  }, [dateRange]); // Refetch when date range changes

  // Calculate running balance for each transaction (from oldest to newest)
  const getTransactionsWithBalance = (txs) => {
    let runningBalance = 0;
    // Copy and sort by created_at ascending
    const sorted = [...txs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return sorted.map(tx => {
      runningBalance += tx.amount;
      return { ...tx, runningBalance };
    });
  };

  // Prepare data for the chart (show last 20 points for clarity)
  const chartData = (() => {
    const txs = getTransactionsWithBalance(transactions);
    const lastTxs = txs.slice(-20);
    return {
      labels: lastTxs.map(tx => new Date(tx.created_at).toLocaleString()),
      datasets: [
        {
          label: 'Wallet Balance',
          data: lastTxs.map(tx => tx.runningBalance),
          fill: false,
          borderColor: '#1976d2',
          backgroundColor: '#1976d2',
          tension: 0.2,
        },
      ],
    };
  })();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Wallet Balance Over Time', font: { size: 18 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { title: { display: true, text: 'Date/Time' } },
      y: { title: { display: true, text: 'Tokens' }, beginAtZero: true },
    },
  };
  if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      );
    }
  // For scrollable transaction list
  const txsWithBalance = getTransactionsWithBalance(transactions).reverse(); // newest first
  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <FaWallet className="text-green-600" size={32} />
          <span className="text-2xl font-bold">Wallet Balance:</span>
          {loadingTxList ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
            </div>
          ):(
          <span className="text-3xl font-mono text-green-700">{balance} tokens</span>
          )}
        </div>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow transition"
          onClick={() => navigate('/token-checkout')}
        >
          <FaPlusCircle className="inline mr-2" /> Buy Tokens
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-6 mb-6 shadow flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-bold">Wallet Balance Over Time</h4>
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
          {loadingTxList ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} height={200} />
          )}
        </div>
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-6 mb-6 shadow flex-1">
          <h4 className="text-lg font-bold mb-2">Recent Token Usage</h4>
          <div style={{ maxHeight: 400, overflowY: 'auto' }} className="rounded-xl bg-gray-50 shadow-inner p-2">
            {loadingTxList ? (
                  <div className="flex justify-center items-center h-32">
                    <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
                  </div>
                ) : txsWithBalance.length === 0 ? (
                  <div className="text-gray-500">No token transactions found for this date range.</div>
                ) : (
              <ul className="space-y-3">
                {txsWithBalance.map((tx) => (
                  <li
                    key={tx.id}
                    className={`flex items-center gap-3 p-3 rounded-lg shadow-sm ${
                      tx.amount > 0
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <FaPlusCircle className="text-green-500" />
                    ) : (
                      <FaMinusCircle className="text-red-500" />
                    )}
                    <span className="font-mono text-lg">{tx.amount > 0 ? '+' : ''}{tx.amount} tokens</span>
                    <span className="text-xs font-semibold ml-2">({tx.source})</span>
                    <span className="ml-auto text-xs">
                      {new Date(tx.created_at).toLocaleString()}
                    </span>
                    <span className="ml-4 text-xs font-bold text-blue-900 bg-blue-100 px-2 py-1 rounded">
                      Balance: {tx.runningBalance}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 