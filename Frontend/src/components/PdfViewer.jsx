import { useEffect, useRef, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Lottie from "lottie-react";
import loaderAnimation from "../assets/loader.json";

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

function PdfViewer({ pdfUrl, onLoad }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(300);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    if (onLoad) onLoad();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'talent_test.pdf'; // set desired file name
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1524) setPageWidth(window.innerWidth * 0.4);
      else if (screenWidth >= 1224) setPageWidth(window.innerWidth * 0.5);
      else if (screenWidth >= 1024) setPageWidth(window.innerWidth * 0.7);
      else if (screenWidth >= 524) setPageWidth(window.innerWidth * 0.6);
      else setPageWidth(200);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center px-2 sm:px-4">
      {/* Navigation + Actions */}
      <div className="flex md:absolute md:-top-10 justify-end items-center w-full text-xs mb-2 sm:mb-4">
        {/* Page Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setPageNumber((prev) => prev - 1)}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-700 font-medium text-[10px] sm:text-xs">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button
            onClick={() => setPageNumber((prev) => prev + 1)}
            disabled={pageNumber >= numPages}
            className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            title="View PDF"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </a>
          <button
            onClick={handleDownload}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      {/* <div className="w-full max-w-3xl border rounded-md shadow-sm bg-white overflow-hidden"> */}
      <div className="w-full max-w-3xl rounded-xl shadow-lg bg-gradient-to-br from-white via-gray-50 to-gray-100 p-1">
        <div className="rounded-xl bg-white overflow-hidden border border-gray-200 shadow-inner">
          <Document
           file={pdfUrl}
           onLoadSuccess={onDocumentLoadSuccess}
           loading={
              <div className="flex justify-center items-center min-h-[70vh]">
                <Lottie animationData={loaderAnimation} loop={true} className="w-44 h-44" />
              </div>
            }
           >
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}

export default PdfViewer;
