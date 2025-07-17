import { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessAlert } from "../utils/sweetAlert.js";

const AdminReferralsPage = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const fetchReferrals = async () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.get(`${base}/accounts/all_referrals`);
      const data = res.data.data || [];

      const savedStatuses = JSON.parse(localStorage.getItem("paymentStatuses")) || {};

      const mergedData = data.map((ref) => ({
        ...ref,
        id: ref.referred_user_email,  // Assuming email is unique
        payment_status: savedStatuses[ref.referred_user_email] || "unpaid",
      }));

      setReferrals(mergedData);
    } catch (err) {
      console.error("Failed to fetch referrals", err);
      setError("Could not fetch referrals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterFromDate, filterToDate, referrals.length]);



  const handlePaymentStatusChange = (refId, newStatus) => {
    const updatedReferrals = referrals.map((ref) =>
      ref.id === refId ? { ...ref, payment_status: newStatus } : ref
    );
    setReferrals(updatedReferrals);
  };

  const savePaymentStatuses = () => {
    const statusesToSave = {};
    referrals.forEach((ref) => {
      statusesToSave[ref.id] = ref.payment_status;
    });
    localStorage.setItem("paymentStatuses", JSON.stringify(statusesToSave));
    showSuccessAlert("", "Payment statuses saved successfully!");
  };


  const exportCSV = () => {
    if (referrals.length === 0) return;
    const headers = [
      "New_user",
      "User_email",
      "Referrer",
      "Referrer_email",
      "Status",
      "Payment_Status",
      "Joined_At",
    ];
    const rows = referrals.map((ref) => [
      ref.referred_user_name,
      ref.referred_user_email,
      ref.referred_by,
      ref.referred_by_email,
      ref.subscription_status,
      ref.payment_status,
      new Date(ref.joined_at).toLocaleString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "referrals.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyBulkStatus = () => {
    const updatedReferrals = referrals.map((ref) =>
      selectedRows.includes(ref.id)
        ? { ...ref, payment_status: bulkStatus }
        : ref
    );
    setReferrals(updatedReferrals);
  };

  const handleSelectRow = (refId) => {
    setSelectedRows((prev) =>
      prev.includes(refId)
        ? prev.filter((id) => id !== refId)
        : [...prev, refId]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = paginatedReferrals.map((ref) => ref.id);
    if (visibleIds.every(id => selectedRows.includes(id))) {
      setSelectedRows(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };



  const filteredReferrals = referrals.filter((ref) => {
    if (
      filterStatus !== "All" &&
      ref.payment_status.toLowerCase() !== filterStatus.toLowerCase()
    )
      return false;
    const joinedAtTime = new Date(ref.joined_at).getTime();
    if (filterFromDate && joinedAtTime < new Date(filterFromDate).getTime())
      return false;
    if (filterToDate && joinedAtTime > new Date(filterToDate).getTime())
      return false;
    return true;
  });

  const totalPages = Math.ceil(filteredReferrals.length / rowsPerPage) || 1;
  const paginatedReferrals = filteredReferrals.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
    );
 

useEffect(() => {
  const visibleIds = paginatedReferrals.map((ref) => ref.id);
  setSelectedRows((prev) => prev.filter((id) => visibleIds.includes(id)));
}, [currentPage, referrals, filterStatus, filterFromDate, filterToDate]);


  if (loading) return <p className="text-gray-500">Loading referrals…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Top Actions */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
      <h2 className="text-2xl font-semibold text-gray-800">All Referrals</h2>
      <div className="flex flex-wrap gap-3">
        <button onClick={savePaymentStatuses} className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto">
          Save
        </button>
        <button onClick={exportCSV} className="px-4 py-2 bg-gray-900 text-white rounded w-full sm:w-auto">
          Export CSV
        </button>
      </div>
    </div>

    {/* Filters */}
    <div className="flex flex-wrap gap-3 mb-6">
      <span className="text-sm">{selectedRows.length} selected</span>

      <select
        value={bulkStatus}
        onChange={(e) => setBulkStatus(e.target.value)}
        className="border px-3 py-2 text-sm rounded w-full sm:w-auto"
      >
        <option value="">Bulk Action</option>
        <option value="paid">Mark as Paid</option>
        <option value="unpaid">Mark as Unpaid</option>
      </select>

      <button
        onClick={applyBulkStatus}
        disabled={!bulkStatus || selectedRows.length === 0}
        className="px-4 py-2 bg-green-600 text-white text-sm rounded w-full sm:w-auto disabled:opacity-50"
      >
        Apply
      </button>

      <span className="text-sm">Status:</span>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="border px-3 py-2 text-sm rounded w-full sm:w-auto"
      >
        <option value="All">All</option>
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
      </select>

      <span className="text-sm">From:</span>
      <input
        type="date"
        value={filterFromDate}
        onChange={(e) => setFilterFromDate(e.target.value)}
        className="border px-3 py-2 text-sm rounded w-full sm:w-auto"
      />

      <span className="text-sm">To:</span>
      <input
        type="date"
        value={filterToDate}
        onChange={(e) => setFilterToDate(e.target.value)}
        className="border px-3 py-2 text-sm rounded w-full sm:w-auto"
      />
    </div>

    {/* Pagination Controls */}
    <div className="flex justify-between items-center mt-6">
      <p className="text-sm text-gray-600">
        Showing {paginatedReferrals.length} of {filteredReferrals.length} referrals
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded border ${
            currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"
          }`}
        >
          Previous
        </button>

        <span className="text-sm text-gray-700 px-2">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded border ${
            currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"
          }`}
        >
          Next
        </button>
      </div>
    </div>


    {/* Table Wrapper */}
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <table className="min-w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={
                  paginatedReferrals.length > 0 &&
                  paginatedReferrals.every((ref) => selectedRows.includes(ref.id))
                }
                onChange={handleSelectAll}
              />
            </th>
            <th className="p-3 text-left text-xs sm:text-sm">New User</th>
            <th className="p-3 text-left text-xs sm:text-sm hidden md:table-cell">User Email</th>
            <th className="p-3 text-left text-xs sm:text-sm hidden md:table-cell">Referrer</th>
            <th className="p-3 text-left text-xs sm:text-sm hidden md:table-cell">Referrer Email</th>
            <th className="p-3 text-left text-xs sm:text-sm">Status</th>
            <th className="p-3 text-left text-xs sm:text-sm">Payment Status</th>
            <th className="p-3 text-left text-xs sm:text-sm">Joined At</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {paginatedReferrals.map((ref) => (
            <tr key={ref.id} className="hover:bg-gray-50">
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(ref.id)}
                  onChange={() => handleSelectRow(ref.id)}
                />

              </td>
              <td className="p-3 text-xs sm:text-sm">{ref.referred_user_name}</td>
              <td className="p-3 text-xs sm:text-sm hidden md:table-cell">{ref.referred_user_email}</td>
              <td className="p-3 text-xs sm:text-sm hidden md:table-cell">{ref.referred_by}</td>
              <td className="p-3 text-xs sm:text-sm hidden md:table-cell">{ref.referred_by_email}</td>
              <td className="p-3 text-xs sm:text-sm">{ref.subscription_status}</td>
              <td className="p-3 text-xs sm:text-sm">
                <select
                  value={ref.payment_status}
                  onChange={(e) => handlePaymentStatusChange(ref.id, e.target.value)}
                  className="border rounded px-2 py-1 w-full sm:w-auto"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </td>
              <td className="p-3 text-xs sm:text-sm">{new Date(ref.joined_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

};

export default AdminReferralsPage;