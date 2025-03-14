import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch payments correctly
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await window.api.getPayments();

        if (response.success && Array.isArray(response.payments)) {
          setPayments(response.payments);
        } else {
          console.error("❌ Invalid payments response:", response);
        }
      } catch (error) {
        console.error("❌ Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // ✅ Delete a payment
  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      const result = await window.api.deletePayment(paymentId);
      
      if (result.success) {
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      } else {
        alert("❌ Failed to delete payment.");
      }
    } catch (error) {
      console.error("❌ Error deleting payment:", error);
    }
  };

  // ✅ Fix filtering and sorting
  const filteredPayments = payments
    .filter((payment) =>
      payment.member_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (sortOrder === "desc" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));

  // ✅ Fix pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
  const currentPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ✅ Pagination controls
  const paginate = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  if (loading) return <div className="text-center text-xl mt-10">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Payments</h1>

      {/* ✅ Search Input */}
      <input
        type="text"
        placeholder="Search by member name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full p-2 border rounded mb-4"
      />

      {/* ✅ Payments Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Member</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Payment Type</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPayments.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">No payments found.</td>
            </tr>
          ) : (
            currentPayments.map((payment) => (
              <tr key={payment.id} className="border-b">
                <td className="px-4 py-2">{payment.date}</td>
                <td className="px-4 py-2">{payment.member_name}</td>
                <td className="px-4 py-2">${payment.amount.toFixed(2)}</td>
                <td className="px-4 py-2">{payment.payment_type}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleDeletePayment(payment.id)} className="text-red-600 hover:text-red-800">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 mx-2 border rounded bg-gray-200">
          Previous
        </button>
        <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages} className="px-4 py-2 mx-2 border rounded bg-gray-200">
          Next
        </button>
      </div>
    </div>
  );
};

export default Payments;

