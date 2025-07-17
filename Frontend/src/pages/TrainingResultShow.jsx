import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { handleUnauthorized } from '../utils/handleUnauthorized';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { UploadCloud, FileDown, FileSpreadsheet, ChevronDown, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import Lottie from "lottie-react";
import loaderAnimation from "../assets/loader.json";

const fetchTrainingAttempts = async (trainingId) => {
  const base = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get(`${base}/training_enrollments/training_attempts_list?training_id=${trainingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    throw err;
  }
};


const calculateDuration = (start, end) => {
  if (!start || !end) return '—';
  const minutes = Math.floor((new Date(end) - new Date(start)) / 60000);
  const sec = Math.floor((new Date(end) - new Date(start)) / 1000) - minutes * 60;
  return `${minutes <= 0 ? '' : minutes + ' m:'}${sec < 10 ? '0' + sec : sec} s`;
};

const exportToPDF = (attempts) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Traning Attempts Report', 14, 15);
  
  // Add table
  const tableColumn = ['Sr. No', 'Name', 'Email', 'Marks', 'Duration'];
  const tableRows = attempts.map((attempt, idx) => [
    idx + 1,
    attempt.name,
    attempt.email,
    attempt.marks ?? '—',
    calculateDuration(attempt.started_at, attempt.completed_at)
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] }
  });

  // Save the PDF
  doc.save('attempts.pdf');
};

const exportToExcel = (attempts) => {
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Prepare data with better formatting
  const formattedData = attempts.map((attempt, idx) => ({
    'Sr. No': idx + 1,
    'Candidate Name': attempt.name,
    'Email Address': attempt.email,
    'Score': attempt.marks ?? '—',
    'Duration': calculateDuration(attempt.started_at, attempt.completed_at),
    'Training Started': new Date(attempt.started_at).toLocaleString(),
    'Training Completed': new Date(attempt.completed_at).toLocaleString(),
    'Status': attempt.completed_at ? 'Completed' : 'Incomplete',
    // 'Number of Images': attempt.image_urls?.length || 0
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths
  const columnWidths = [
    { wch: 8 },  // Sr. No
    { wch: 25 }, // Candidate Name
    { wch: 30 }, // Email Address
    { wch: 10 }, // Score
    { wch: 15 }, // Duration
    { wch: 20 }, // Training Started
    { wch: 20 }, // Training Completed
    { wch: 12 }, // Status
    // { wch: 15 }  // Number of Images
  ];
  worksheet['!cols'] = columnWidths;

  // Add summary statistics
  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter(a => a.completed_at).length;
  const averageScore = attempts.reduce((acc, curr) => acc + (curr.marks || 0), 0) / totalAttempts;

  // Add summary data with styling
  XLSX.utils.sheet_add_aoa(worksheet, [
    ['Training Results Summary'],
    ['Total Attempts', totalAttempts],
    ['Completed Attempts', completedAttempts],
    ['Average Score', averageScore.toFixed(2)],
    ['Report Generated', new Date().toLocaleString()],
    [], // Empty row for spacing
    ['Detailed Results']
  ], { origin: 'A1' });

  // Style the summary section
  const summaryStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4A90E2" } }, // Blue background
    alignment: { horizontal: "center" }
  };

  // Apply styles to summary cells
  for (let i = 0; i < 7; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
    if (!worksheet[cellRef]) continue;
    
    worksheet[cellRef].s = {
      ...summaryStyle,
      font: { ...summaryStyle.font, size: i === 0 ? 14 : 11 } // Larger font for title
    };

    // Style the value cells in summary
    if (i > 0 && i < 5) {
      const valueCellRef = XLSX.utils.encode_cell({ r: i, c: 1 });
      if (worksheet[valueCellRef]) {
        worksheet[valueCellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "E8F0FE" } } // Light blue background
        };
      }
    }
  }

  // Move the data down to make room for summary
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const dataStartRow = 7; // After summary
  const dataRange = {
    s: { r: dataStartRow, c: 0 },
    e: { r: range.e.r + dataStartRow, c: range.e.c }
  };
  
  // Shift data down
  const newData = {};
  Object.keys(worksheet).forEach(key => {
    if (key[0] === '!') return;
    const cell = XLSX.utils.decode_cell(key);
    if (cell.r >= 0) {
      const newKey = XLSX.utils.encode_cell({ r: cell.r + dataStartRow, c: cell.c });
      newData[newKey] = worksheet[key];
    }
  });
  
  // Add headers with styling
  const headers = Object.keys(formattedData[0]);
  headers.forEach((header, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: dataStartRow, c: index });
    newData[cellRef] = {
      v: header,
      s: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2C3E50" } }, // Dark blue-gray background
        alignment: { horizontal: "center" }
      }
    };
  });

  // Style the data rows
  formattedData.forEach((_, rowIndex) => {
    headers.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: dataStartRow + 1 + rowIndex, c: colIndex });
      if (newData[cellRef]) {
        newData[cellRef].s = {
          font: { size: 11 },
          fill: { fgColor: { rgb: rowIndex % 2 === 0 ? "F8F9FA" : "FFFFFF" } }, // Alternating row colors
          alignment: { horizontal: "left" }
        };
      }
    });
  });

  // Update worksheet with new data
  worksheet['!ref'] = XLSX.utils.encode_range(dataRange);
  Object.assign(worksheet, newData);

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Training Results');
  
  // Save the Excel file with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `traning-attempts-${timestamp}.xlsx`);
};

export default function TrainingResultShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'marks', direction: 'desc' });
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [displayedRecords, setDisplayedRecords] = useState(10);
  const loaderRef = useRef(null);
  const recordsPerPage = 10;

  const {
      data: attempts,
      isLoading,
      error,
    } = useQuery({
      queryKey: ['trainingAttempts', id],
      queryFn: () => fetchTrainingAttempts(id),
    });

  const sortOptions = [
    { label: 'Marks (High to Low)', short: 'Marks ↓', key: 'marks', direction: 'desc' },
    { label: 'Marks (Low to High)', short: 'Marks ↑', key: 'marks', direction: 'asc' },
    { label: 'Name (A to Z)', short: 'Name A-Z', key: 'name', direction: 'asc' },
    { label: 'Name (Z to A)', short: 'Name Z-A', key: 'name', direction: 'desc' },
    { label: 'Duration (Long to Short)', short: 'Duration ↓', key: 'duration', direction: 'desc' },
    { label: 'Duration (Short to Long)', short: 'Duration ↑', key: 'duration', direction: 'asc' },
  ];

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
    setIsSortMenuOpen(false);
  };

  const getSortedAttempts = () => {
    if (!attempts) return [];

    return [...attempts].sort((a, b) => {
      if (sortConfig.key === 'duration') {
        const durationA = new Date(a.completed_at) - new Date(a.started_at);
        const durationB = new Date(b.completed_at) - new Date(b.started_at);
        return sortConfig.direction === 'asc' ? durationA - durationB : durationB - durationA;
      }

      if (sortConfig.key === 'marks') {
        const marksA = a.marks ?? 0;
        const marksB = b.marks ?? 0;
        return sortConfig.direction === 'asc' ? marksA - marksB : marksB - marksA;
      }

      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      return 0;
    });
  };

  const getVisibleData = () => {
    const sortedData = getSortedAttempts();
    return sortedData.slice(0, displayedRecords);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && attempts && displayedRecords < attempts.length) {
          setDisplayedRecords((prev) => Math.min(prev + recordsPerPage, attempts.length));
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [displayedRecords, attempts]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Lottie animationData={loaderAnimation} loop={true} className="w-44 h-44" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  const visibleAttempts = getVisibleData();

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-6 md:ml-50 pt-16 sm:pt-12 md:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-2xl font-bold">Traning Attempts</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className='flex gap-2 justify-end'>
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="inline-flex items-center gap-2 pl-4 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto text-sm sm:text-base"
              >
                <span>Sort by</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isSortMenuOpen && (
                <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.key}-${option.direction}`}
                        onClick={() => handleSort(option.key, option.direction)}
                        className={`block w-full text-left px-4 py-2 text-sm sm:text-base ${
                          sortConfig.key === option.key && sortConfig.direction === option.direction
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        role="menuitem"
                      >
                        <span className="sm:hidden">{option.short}</span>
                        <span className="hidden sm:inline">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => window.history.back()}
              className="inline-block text-white bg-gray-600 hover:bg-gray-700 font-semibold py-2 px-4 rounded-md text-sm sm:text-base"
            >
              Back
            </button>
            {attempts && attempts.length > 0 && (
              <>
                <button
                  onClick={() => exportToPDF(attempts)}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg shadow-lg cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                >
                  <FileDown className="w-5 h-5" />
                  <span className="hidden xs:inline">Export PDF</span>
                  <span className="inline xs:hidden">PDF</span>
                </button>
                <button
                  onClick={() => exportToExcel(attempts)}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r from-green-600 to-lime-500 text-white text-sm font-medium rounded-lg shadow-lg cursor-pointer hover:from-green-700 hover:to-lime-600 transition-all duration-300"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="hidden xs:inline">Export Excel</span>
                  <span className="inline xs:hidden">Excel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Card View */}
      <div className="sm:hidden flex flex-col gap-4">
        {visibleAttempts && visibleAttempts.length > 0 ? (
          visibleAttempts.map((attempt, idx) => (
            <div key={attempt.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-200 mb-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-base">{attempt.name}</span>
                <span className="text-xs text-gray-400">#{idx + 1}</span>
              </div>
              <div className="text-xs text-gray-600 break-all">{attempt.email}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-gray-500">Marks: <span className="text-red-500 font-semibold">{attempt.marks ?? '—'}</span></span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-gray-500">Duration: <span className="text-blue-500 font-semibold">{calculateDuration(attempt.started_at, attempt.completed_at)}</span></span>
                <td className="p-1 md:p-3"></td>
              </div>
              <button
                // onClick={() => navigate(`/response/${attempt.guest_token}`)}
                className={`max-w-20 mt-2 text-xs font-semibold text-white ${
                  attempt.completed_at
                    ? 'bg-green-500 hover:bg-green-500'
                    : 'bg-yellow-500 hover:bg-yellow-500'
                } py-1 rounded transition`}
                disabled={!attempt.completed_at}
              >
                {attempt.completed_at ? 'Completed' : 'Pending'}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">No attempts found.</div>
        )}
      </div>
      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-700 text-xs md:text-sm">
              <th className="p-1 md:p-3">Sr. no</th>
              <th className="p-1 md:p-3">Name</th>
              <th className="p-1 md:p-3">Email</th>
              <th className="p-1 md:p-3">Status</th>
              <th className="p-1 md:p-3">Marks</th>
              <th className="p-1 md:p-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {(!visibleAttempts || visibleAttempts.length === 0) ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No attempts found.
                </td>
              </tr>
            ) : (
              visibleAttempts.map((attempt, idx) => (
                <tr key={attempt.id} className="border-t text-xs md:text-sm text-gray-800 hover:bg-gray-50">
                  <td className="p-1 md:p-3">{idx + 1}</td>
                  <td className="p-1 md:p-3">{attempt.name}</td>
                  <td className="p-1 md:p-3">{attempt.email}</td>
                  <td className="p-1 md:p-3">
                    {attempt.completed_at ? (
                      <button
                        // onClick={() => navigate(`/response/${attempt.guest_token}`)}
                        // className="text-xs md:text-sm inline-block text-white bg-gray-600 hover:bg-gray-700 py-1 px-2 rounded"
                        className="text-xs md:text-sm inline-block  py-1 rounded"
                      >
                        <span>Completed</span>
                      </button>
                    ) : (
                      <button
                        className="text-xs md:text-sm inline-block py-1 rounded"
                        disabled
                      >
                        <span>Pending</span>
                      </button>
                    )}
                  </td>
                  <td className="p-1 md:p-3 text-red-500">{attempt.marks ?? '—'}</td>
                  <td className="p-1 md:p-3 text-blue-500">{calculateDuration(attempt.started_at, attempt.completed_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Loading indicator */}
      {attempts && displayedRecords < attempts.length && (
        <div ref={loaderRef} className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
} 