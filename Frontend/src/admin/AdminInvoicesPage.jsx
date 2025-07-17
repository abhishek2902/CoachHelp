import React, { useEffect, useState } from "react";
import { DownloadCloud, LoaderCircle, Globe } from "lucide-react";

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const base = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
  });

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/invoices?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      setInvoices(data.invoices || []);
      setPagination({
        current_page: data.current_page,
        total_pages: data.total_pages,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(pagination.current_page);
  }, []);

  const downloadInvoicePDF = async (invoiceId) => {
    try {
      const response = await fetch(`${base}/invoices/${invoiceId}.pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch invoice PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice PDF:", error);
    }
  };

  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount || isNaN(amount)) return '₹0';
    
    const numAmount = parseFloat(amount);
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥'
    };
    
    const symbol = symbols[currency.toUpperCase()] || currency;
    
    if (currency.toUpperCase() === 'JPY') {
      return `${symbol}${Math.round(numAmount)}`;
    }
    
    return `${symbol}${numAmount.toFixed(2)}`;
  };

  const filteredInvoices = invoices.filter((invoice) =>
    `${invoice.invoice_number} ${invoice.user_name} ${invoice.user_email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
     {/* Heading + Search Filter */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-800">
          📄 All Invoices (Admin)
        </h2>

        <input
          type="text"
          placeholder="Search by invoice number, user name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 w-full sm:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      { loading ? (
        <div className="flex justify-center items-center h-48">
          <span className="text-gray-500 text-lg"><LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" /></span>
        </div>
        ):( <>

        {filteredInvoices.length === 0 ? (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <p className="text-gray-600 text-lg">
              🧾 No invoices found.
            </p>
          </div>
          ) : (
          <div className="overflow-x-auto rounded-xl shadow border border-gray-200 dark:border-gray-600">
            <table className="min-w-[600px] w-full text-left text-sm text-gray-800 dark:text-gray-800">
              <thead className="bg-gray-900 dark:bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 border-b">Invoice No.</th>
                  <th className="px-4 py-3 border-b">User</th>
                  <th className="px-4 py-3 border-b">Email</th>
                  <th className="px-4 py-3 border-b">Amount (₹)</th>
                  <th className="px-4 py-3 border-b">Issued At</th>
                  <th className="px-4 py-3 border-b text-center">Download</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, index) => (
                  <tr
                    key={invoice.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition duration-200`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      #{invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-gray-800">{invoice.user_name}</td>
                    <td className="px-6 py-4 text-gray-800">{invoice.user_email}</td>
                    <td className="px-6 py-4 font-bold text-green-700">
                      ₹{Number(invoice.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {new Date(invoice.issued_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => downloadInvoicePDF(invoice.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto"
                      >
                        <DownloadCloud size={20} />
                        <span className="hidden md:inline">PDF</span>
                      </button>
                    </td>
                  </tr>
                  ))}
              </tbody>
            </table>

            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => fetchInvoices(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => fetchInvoices(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>

          </div>
          )}
          </>
        )}
    </div>
  );
};

export default AdminInvoicesPage;
