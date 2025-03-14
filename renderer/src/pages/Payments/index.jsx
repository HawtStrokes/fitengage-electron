import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [payments, setPayments] = useState([]);
  const [membershipTypes, setMembershipTypes] = useState({});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [newPayment, setNewPayment] = useState({ member_id: "", amount: "", payment_type: "" });
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsResponse, membershipTypesResponse, membersResponse] = await Promise.all([
          window.api.getPayments(),
          window.api.getMembershipTypes(),
          window.api.getMembers(),
        ]);

        if (paymentsResponse.success && Array.isArray(paymentsResponse.payments)) {
          // Map member IDs to member names
          const membersMap = {};
          membersResponse.forEach((member) => {
            membersMap[member.id] = member.name; // Store member name by member ID
          });

          const paymentsWithMemberNames = paymentsResponse.payments.map((payment) => ({
            ...payment,
            member_name: membersMap[payment.member_id] || "Unknown", // Use member name or default to "Unknown"
          }));

          setPayments(paymentsWithMemberNames);
        } else {
          console.error("Invalid payments response:", paymentsResponse);
        }

        if (Array.isArray(membershipTypesResponse)) {
          const typeMap = {};
          membershipTypesResponse.forEach((type) => {
            typeMap[type.id] = type.name; // Map ID to human-readable name
          });
          setMembershipTypes(typeMap);
        }

        if (Array.isArray(membersResponse)) {
          setMembers(membersResponse); // Set list of members for search
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

const handleAddPayment = async () => {
  if (!newPayment.member_id || !newPayment.amount || !newPayment.payment_type) {
    alert("Please fill all fields");
    return;
  }

  try {
    // Log the payment data for debugging
    console.log("Adding Payment Data:", newPayment);

    // Log membership types for debugging
    console.log("Membership Types:", membershipTypes);

    // Find the payment type ID by matching the payment type name
    const paymentTypeId = Object.keys(membershipTypes).find(
      (key) => membershipTypes[key] === newPayment.payment_type
    );

    // Log the found paymentTypeId
    console.log("Found Payment Type ID:", paymentTypeId);

    // Ensure paymentTypeId is found
    if (!paymentTypeId) {
      alert("Payment type is invalid.");
      return;
    }

    // Convert paymentTypeId to a number (to match backend expectations)
    const paymentTypeIdNumber = Number(paymentTypeId); // Convert to integer

    // Create paymentData with the correct type_id (as number)
    const paymentData = {
      member_id: newPayment.member_id,
      amount: newPayment.amount,
      payment_type_id: paymentTypeIdNumber, // Use the number instead of the string
    };

    // Log payment data being sent
    console.log("Adding payment:", paymentData);

    // Send data to API and handle the result
    const result = await window.api.addPayment(paymentData);

    if (result.success) {
      // Log the successful result
      console.log("Payment Added Successfully:", result);
      setPayments([...payments, result.payment]);
      setShowForm(false);
      setNewPayment({ member_id: "", amount: "", payment_type: "" });
    } else {
      // Handle error response
      console.error("Error adding payment:", result.message);
      alert(`Failed to add payment: ${result.message}`);
    }
  } catch (error) {
    console.error("Error invoking add-payment method:", error);
    alert("An error occurred while adding the payment.");
  }
};


  const handleDeletePayment = async (paymentId, paymentDate) => {
    const paymentAge = (new Date() - new Date(paymentDate)) / (1000 * 60 * 60 * 24);
    if (paymentAge > 30) {
      alert("Cannot delete payments older than 30 days.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      const result = await window.api.deletePayment(paymentId);
      if (result.success) {
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      } else {
        alert("Failed to delete payment.");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const filteredPayments = payments
    .filter((payment) =>
      payment.member_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "desc" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
  const currentPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const paginate = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  if (loading) return <div className="text-center text-xl mt-10">Loading...</div>;

  return (
    <div className="p-6 min-h-screen flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-6">Payments</h1>
      <button
        onClick={() => setShowForm(true)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
      >
        <FaPlus /> Add Payment
      </button>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg w-full max-w-md">
          <select
            value={newPayment.member_id}
            onChange={(e) => setNewPayment({ ...newPayment, member_id: e.target.value })}
            className="block w-full p-2 border rounded mb-2"
          >
            <option value="">Select Member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
            className="block w-full p-2 border rounded mb-2"
          />

          <select
            value={newPayment.payment_type}
            onChange={(e) => setNewPayment({ ...newPayment, payment_type: e.target.value })}
            className="block w-full p-2 border rounded mb-2"
          >
            <option value="">Select Payment Type</option>
            {Object.entries(membershipTypes).map(([id, name]) => (
              <option key={id} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button onClick={handleAddPayment} className="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
        </div>
      )}

      <input
        type="text"
        placeholder="Search by member name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full max-w-lg p-3 border border-gray-300 rounded-lg shadow-sm mb-4 focus:ring-2 focus:ring-blue-400"
      />

      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="w-full border-collapse shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className="px-4 py-3 w-1/5">Date</th>
              <th className="px-4 py-3 w-2/5">Member</th>
              <th className="px-4 py-3 w-1/5">Amount</th>
              <th className="px-4 py-3 w-1/5">Payment Type</th>
              <th className="px-4 py-3 text-center w-1/6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPayments.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">No payments found.</td>
              </tr>
            ) : (
              currentPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-3 truncate">{payment.date}</td>
                  <td className="px-4 py-3 truncate">{payment.member_name}</td>
                  <td className="px-4 py-3 truncate">${payment.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 truncate">{payment.payment_type}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeletePayment(payment.id, payment.date)}
                      className="text-red-600 hover:text-red-800 transition duration-150"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2">{`${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Payments;

