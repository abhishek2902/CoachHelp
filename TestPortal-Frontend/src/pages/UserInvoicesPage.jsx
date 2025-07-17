import React, { useEffect, useState } from "react";
import { FileText, Download, LoaderCircle, Globe } from "lucide-react";
const UserInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const base = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${base}/invoices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data.invoices);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching invoices:", error);
        setLoading(false);
      });
  }, [base, token]);

  const downloadInvoicePDF = async (invoiceId) => {
    try {
      const response = await fetch(`${base}/invoices/${invoiceId}.pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="text-gray-500 text-lg"><LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" /></span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Invoices</h1>
        <p className="text-gray-600">Download and view your payment invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't made any purchases yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center mb-5">
                  <div className="bg-gray-100 p-2 rounded-xl mr-3">
                    <FileText className="text-gray-700" size={22} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">
                      Invoice #{invoice.invoice_number}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {new Date(invoice.issued_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-3xl font-extrabold text-gray-900 mb-1">
                    {invoice.currency === 'INR' && (
                      <>{formatCurrency(invoice.total_amount || invoice.amount, 'INR')}</>
                    )}
                    {invoice.currency !== 'INR' && invoice.converted_total_amount && (
                      <>
                        {formatCurrency(invoice.converted_total_amount, invoice.currency)}
                        <span className="ml-2 text-xs text-gray-400">({invoice.currency})</span>
                      </>
                    )}
                    {invoice.payment_method === 'paypal' && invoice.total_amount && invoice.currency && (
                      <>
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                        <span className="ml-2 text-xs text-gray-400">(PayPal)</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 tracking-wide uppercase">
                    Amount Paid
                  </div>
                  {invoice.currency === 'INR' && invoice.gst_amount > 0 && (
                    <div className="text-xs text-yellow-700 mt-1">
                      GST: {formatCurrency(invoice.gst_amount, 'INR')}
                    </div>
                  )}
                  {invoice.currency !== 'INR' && invoice.original_amount && invoice.converted_total_amount && (
                    <div className="mt-2 flex flex-col gap-1 text-xs text-gray-400">
                      <span>Original: {formatCurrency(invoice.original_amount, 'INR')}</span>
                      {invoice.original_amount > 0 && (
                        <span>Rate: 1 INR = {(invoice.converted_total_amount / invoice.original_amount).toFixed(4)} {invoice.currency}</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => downloadInvoicePDF(invoice.id)}
                  className="mt-auto flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition"
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserInvoicesPage;
